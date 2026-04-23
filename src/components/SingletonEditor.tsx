'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Singleton } from '@/lib/cms/types'
import type { ParsedDocument } from '@/lib/cms/parser'
import FieldRenderer from '@/components/FieldRenderer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import RichTextField from '@/components/fields/RichTextField'
import { cmsFetch } from '@/lib/cms/fetch'

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
    try {
      const res = await cmsFetch(`/api/repos/${repoId}/content`, {
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
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Saved')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-background border-b px-8 py-4 flex items-center justify-between">
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

      <div className="p-8 max-w-2xl flex flex-col gap-6">
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
          <div className="flex flex-col gap-4 pt-1">
            <RichTextField
              field={{ name: 'body', label: 'Page Content', type: 'rich-text' }}
              value={body}
              onChangeAction={value => setBody(value as string)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}