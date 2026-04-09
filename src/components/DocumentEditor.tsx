'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Collection } from '@/lib/cms/types'
import type { ParsedDocument } from '@/lib/cms/parser'
import FieldRenderer from './FieldRenderer'

type Props = {
  projectId: string
  collection: Collection
  document: ParsedDocument
  filePath: string | null
  isNew: boolean
  collectionPath: string
}

export default function DocumentEditor({
  projectId,
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

    await fetch(`/api/projects/${projectId}/content`, {
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
      router.push(`/dashboard/${projectId}/${collection.name}`)
    } else {
      router.refresh()
    }
  }

  return (
    <div>
      {isNew && (
        <div>
          <label>Filename (no extension)</label>
          <input
            type="text"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            placeholder="my-new-project"
            required
          />
        </div>
      )}
      {collection.fields.map(field => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={frontmatter[field.name]}
          onChange={value => updateField(field.name, value)}
        />
      ))}
      <div>
        <label>Page Content</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </div>
      <button onClick={handleSave} disabled={saving || (isNew && !filename)}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}