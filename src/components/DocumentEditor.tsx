'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Collection } from '@/lib/cms/types'
import type { ParsedDocument } from '@/lib/cms/parser'
import FieldRenderer from './FieldRenderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

type Props = {
  repoId: string
  collection: Collection
  document: ParsedDocument
  filePath: string | null
  isNew: boolean
  collectionPath: string
}

export default function DocumentEditor({
  repoId,
  collection,
  document,
  filePath,
  isNew,
  collectionPath,
}: Props) {
  const router = useRouter()
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>(document.frontmatter)
  const [body, setBody] = useState(document.body)
  const [filename, setFilename] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(name: string, value: unknown) {
    setFrontmatter(prev => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    setSaving(true)

    const resolvedFilePath = isNew
      ? `${collectionPath}/${filename}.md`
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

    setSaving(false)

    if (isNew) {
      router.push(`/dashboard/${repoId}/${collection.name}`)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">
          {isNew ? `New ${collection.label}` : `Edit ${collection.label}`}
        </h1>
        <Button
          onClick={handleSave}
          disabled={saving || (isNew && !filename)}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {isNew && (
          <div className="space-y-1">
            <Label htmlFor="filename">Filename (no extension)</Label>
            <div className="flex flex-col gap-4 pt-1">
              <Input
                id="filename"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="my-new-document"
                required
              />
            </div>
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
          <Label>Page Content</Label>
          <div className="flex flex-col gap-4 pt-1">
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              className="min-h-64 font-mono text-sm"
              placeholder="Write your markdown content here..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}