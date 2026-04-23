'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Collection } from '@/lib/cms/types'
import type { ParsedDocument } from '@/lib/cms/parser'
import FieldRenderer from '@/components/FieldRenderer'
import { Button } from '@/components/ui/button'
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
import Link from 'next/link'
import DeleteDocumentButton from '@/components/DeleteDocumentButton'
import RichTextField from './fields/RichTextField'
import { resolveSlug, toSlug } from '@/lib/cms/slugify'

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

  const savedPublished = useRef<boolean>(
    collection.publishable
      ? (document.frontmatter.published ?? true) as boolean
      : true
  )

  const currentPublished = collection.publishable
    ? (frontmatter.published ?? true) as boolean
    : true

  const publishedChanged = collection.publishable && currentPublished !== savedPublished.current

  function updateField(name: string, value: unknown) {
    setFrontmatter(prev => ({ ...prev, [name]: value }))
  }

  async function performSave() {
    setSaving(true)

    const resolvedFilePath = isNew
      ? await (async () => {
          const existing: string[] = await fetch(
            `/api/repos/${repoId}/collections/${collectionName}/slugs`
          ).then(r => r.json())
          const base = toSlug(String(frontmatter.title ?? ''))
          const slug = resolveSlug(base, existing)
          return `${collectionPath}/${slug}.md`
        })()
      : filePath

    await fetch(`/api/repos/${repoId}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frontmatter,
        body,
        sha: document.sha,
        filePath: resolvedFilePath,
        isNew,
      }),
    })

    savedPublished.current = currentPublished
    setSaving(false)

    if (isNew) {
      router.push(`/dashboard/${repoId}/${collection.name}`)
    } else {
      router.refresh()
    }
  }

  async function handleSave() {
    const requiresConfirm = publishedChanged || (isNew && !currentPublished)
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
              {currentPublished ? 'Publish this document?' : 'Unpublish this document?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentPublished
                ? 'This document will be publicly visible on the site after the next build.'
                : 'This document will be hidden from the site after the next build.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performSave}>
              {currentPublished ? 'Publish' : 'Unpublish'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col">
        {/* Sticky header */}
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
              disabled={saving || (isNew && !frontmatter.title)}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Scrolling content */}
        <div className="p-8 max-w-2xl flex flex-col gap-6">
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