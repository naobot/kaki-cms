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
  filePath: string
}

export default function DocumentEditor({ projectId, collection, document, filePath }: Props) {
  const router = useRouter()
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>(document.frontmatter)
  const [body, setBody] = useState(document.body)
  const [saving, setSaving] = useState(false)

  function updateField(name: string, value: unknown) {
    setFrontmatter(prev => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/projects/${projectId}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frontmatter, body, sha: document.sha, filePath }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div>
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
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
