'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Collection } from '@/lib/cms/types'
import type { ParsedDocument } from '@/lib/cms/parser'
import FieldRenderer from '@/components/FieldRenderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import DeleteDocumentButton from '@/components/DeleteDocumentButton'
import RichTextField from '@/components/fields/RichTextField'
import { resolveSlug, toSlug } from '@/lib/cms/slugify'
import { cmsFetch } from '@/lib/cms/fetch'

type Props = {
  repoId: string
  githubRepo: string
  collection: Collection
  document: ParsedDocument
  filePath: string | null
  isNew: boolean
  collectionPath: string
  collectionName: string
}

export default function DocumentEditor({
  repoId,
  githubRepo,
  collection,
  document,
  filePath,
  isNew,
  collectionPath,
  collectionName,
}: Props) {
  const router = useRouter()
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>(() => {
    if (collection.publishable && document.frontmatter.published === undefined) {
      return { ...document.frontmatter, published: true }
    }
    return document.frontmatter
  })
  const [body, setBody] = useState(document.body)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Documents can live in sub-directories of the collection, so only the
  // basename is editable. For date-prefixed collections the date stays fixed —
  // the site's routing depends on it.
  const dirPath = filePath ? filePath.slice(0, filePath.lastIndexOf('/')) : collectionPath
  const basename = filePath ? filePath.slice(filePath.lastIndexOf('/') + 1).replace(/\.md$/, '') : ''
  const dateMatch = collection.slugify_with_date ? basename.match(/^\d{4}-\d{2}-\d{2}-/) : null
  const datePrefix = dateMatch ? dateMatch[0] : ''
  const savedSlug = basename.slice(datePrefix.length)

  const [slug, setSlug] = useState(savedSlug)
  const [editingSlug, setEditingSlug] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)

  const normalisedSlug = toSlug(slug)
  // Compare against the raw input too: an existing filename that doesn't
  // already normalise cleanly must not count as an edit the user didn't make.
  const slugChanged = !isNew && slug !== savedSlug && normalisedSlug !== savedSlug
  const slugValid = !slugChanged || normalisedSlug.length > 0

  const savedPublished = useRef<boolean>(
    collection.publishable
      ? (document.frontmatter.published ?? true) as boolean
      : true
  )

  const currentPublished = collection.publishable
    ? (frontmatter.published ?? true) as boolean
    : true

  const publishedChanged = collection.publishable && currentPublished !== savedPublished.current
  const publishConfirm = publishedChanged || (isNew && !currentPublished)

  function updateField(name: string, value: unknown) {
    setFrontmatter(prev => ({ ...prev, [name]: value }))
  }

  /**
   * Pre-flight check so a clash is reported inline rather than after the user
   * has confirmed the rename. The API enforces this again on save.
   */
  async function slugIsAvailable(): Promise<boolean> {
    if (!slugValid) {
      setEditingSlug(true)
      setSlugError('Enter a slug.')
      return false
    }

    // The slugs endpoint only lists the top level of the collection.
    if (dirPath !== collectionPath) return true

    try {
      const res = await cmsFetch(`/api/repos/${repoId}/collections/${collectionName}/slugs`)
      if (!res.ok) return true
      const existing: string[] = await res.json()
      if (existing.includes(`${datePrefix}${normalisedSlug}`)) {
        setEditingSlug(true)
        setSlugError('That slug is already used by another item in this collection.')
        return false
      }
    } catch {
      // Fall through and let the API be the authority.
    }

    setSlugError(null)
    return true
  }

  async function performSave() {
    setSaving(true)

    try {
      const resolvedFilePath = isNew
        ? await (async () => {
            const res = await cmsFetch(`/api/repos/${repoId}/collections/${collectionName}/slugs`)
            if (!res.ok) throw new Error('Failed to fetch existing slugs')
            const existing: string[] = await res.json()
            const base = toSlug(String(frontmatter.title ?? ''))
            const slug = resolveSlug(base, existing)

            if (collection.slugify_with_date) {
              const dateSource = frontmatter.publish_date
                ? new Date(String(frontmatter.publish_date))
                : new Date()
              const datePrefix = dateSource.toISOString().slice(0, 10) // YYYY-MM-DD
              return `${collectionPath}/${datePrefix}-${slug}.md`
            }

            return `${collectionPath}/${slug}.md`
          })()
        : filePath

      const targetFilePath = slugChanged
        ? `${dirPath}/${datePrefix}${normalisedSlug}.md`
        : resolvedFilePath

      const res = await cmsFetch(`/api/repos/${repoId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontmatter,
          body,
          sha: document.sha,
          filePath: targetFilePath,
          previousFilePath: slugChanged ? filePath : undefined,
          isNew,
        }),
      })

      if (res.status === 409) {
        setEditingSlug(true)
        setSlugError('That slug is already used by another item in this collection.')
        throw new Error('That slug is already taken')
      }

      if (!res.ok) throw new Error('Failed to save document')

      savedPublished.current = currentPublished
      toast.success(isNew ? 'Document created' : 'Document saved')

      if (isNew) {
        router.push(`/dashboard/${repoId}/${collection.name}`)
      } else if (slugChanged && targetFilePath) {
        setSlug(normalisedSlug)
        setEditingSlug(false)
        // The current URL points at the old filename, so move to the new one.
        const relativePath = targetFilePath
          .slice(collectionPath.length + 1)
          .replace(/\.md$/, '')
        router.replace(`/dashboard/${repoId}/${collectionName}/${relativePath}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    if (slugChanged && !(await slugIsAvailable())) return

    const requiresConfirm = publishConfirm || slugChanged
    if (requiresConfirm) {
      setShowConfirm(true)
    } else {
      await performSave()
    }
  }

  return (
    <>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {publishConfirm
                ? currentPublished ? 'Publish this document?' : 'Unpublish this document?'
                : 'Change this slug?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2">
                {publishConfirm && (
                  <span>
                    {currentPublished
                      ? 'This document will be publicly visible on the site after the next build.'
                      : 'This document will be hidden from the site after the next build.'}
                  </span>
                )}
                {slugChanged && (
                  <span>
                    The file will be renamed to{' '}
                    <code className="font-mono">{datePrefix}{normalisedSlug}.md</code>, which changes
                    this item&apos;s URL on the site. Any existing links to the old URL will break.
                  </span>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performSave}>
              {publishConfirm
                ? currentPublished ? 'Publish' : 'Unpublish'
                : 'Rename'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col">
        <div className="sticky top-0 z-10 bg-background border-b px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {isNew ? `New ${collection.label}` : `Edit ${collection.label}`}
          </h1>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href={`/dashboard/${repoId}/${collection.name}`}>← Back</Link>
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || (isNew && !frontmatter.title) || (!isNew && !slugValid)}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="p-8 max-w-2xl flex flex-col gap-6">
          {!isNew && filePath && (
            <div className="rounded-lg border px-4 py-4 flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              {editingSlug ? (
                <>
                  <div className="flex items-center gap-2">
                    {datePrefix && (
                      <span className="text-sm font-mono text-muted-foreground shrink-0">
                        {datePrefix}
                      </span>
                    )}
                    <Input
                      id="slug"
                      value={slug}
                      autoFocus
                      className="font-mono"
                      onChange={e => {
                        setSlug(e.target.value)
                        setSlugError(null)
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSlug(savedSlug)
                        setSlugError(null)
                        setEditingSlug(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  {slugError ? (
                    <p className="text-xs text-destructive">{slugError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {slugChanged && slugValid
                        ? <>Will be saved as <code className="font-mono">{datePrefix}{normalisedSlug}</code>. Renaming changes this item&apos;s URL on the site.</>
                        : 'Renaming changes this item’s URL on the site, breaking existing links to it.'}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm font-mono truncate">{datePrefix}{savedSlug}</code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSlug(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          )}

          {collection.publishable && (
            <div className="flex items-center justify-between rounded-lg border px-4 py-4">
              <div className="space-y-0.5">
                <Label htmlFor="published">Publish?</Label>
                <p className="text-xs text-muted-foreground mt-2">
                  {currentPublished ? 'Visible on the site after next build' : 'Currently hidden from the site'}
                </p>
              </div>
              <Switch
                id="published"
                checked={currentPublished}
                onCheckedChange={value => updateField('published', value)}
              />
            </div>
          )}

          {collection.fields.map(field => (
            <FieldRenderer
              key={field.name}
              field={field}
              value={frontmatter[field.name]}
              onChangeAction={value => updateField(field.name, value)}
            />
          ))}

          <Separator />

          <div className="space-y-1">
            <div className="flex flex-col gap-4 pt-1">
              <RichTextField
                field={{ name: 'body', label: 'Page Content', type: 'rich-text' }}
                value={body}
                onChangeAction={value => setBody(value as string)}
              />
            </div>
          </div>

          {!isNew && filePath && document.sha && (
            <>
              <Separator />
              <div className="flex justify-center mx-2">
                <DeleteDocumentButton
                  repoId={repoId}
                  filePath={filePath}
                  sha={document.sha}
                  redirectTo={`/dashboard/${repoId}/${collection.name}`}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}