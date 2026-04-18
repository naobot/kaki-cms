'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Singleton } from '@/lib/cms/types'
import type { ParsedDocument } from '@/lib/cms/parser'
import FieldRenderer from '@/components/FieldRenderer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

type Props = {
  repoId: string
  githubRepo: string
  singleton: Singleton
  document: ParsedDocument
  filePath: string
}

export default function SingletonEditor({
  repoId,
  githubRepo,
  singleton,
  document,
  filePath,
}: Props) {
  const router = useRouter()
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>(document.frontmatter)
  const [body, setBody] = useState(document.body)
  const [saving, setSaving] = useState(false)

  function updateField(name: string, value: unknown) {
    setFrontmatter(prev => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    setSaving(true)

    await fetch(`/api/repos/${repoId}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frontmatter,
        body,
        sha: document.sha,
        filePath,
        isNew: false,
      }),
    })

    setSaving(false)
    router.refresh()
  }

  return (
    <>
      <div className="p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Edit {singleton.label}</h1>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href={`/dashboard/${repoId}`}>← Back</Link>
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {singleton.fields.map(field => (
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
    </>
  )
}