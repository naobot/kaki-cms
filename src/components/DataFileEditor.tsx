'use client'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import FieldRenderer from '@/components/FieldRenderer'
import type { Field } from '@/lib/cms/types'
import type { UserType } from '@/lib/cms/user'
import * as yaml from 'js-yaml'

type GitHubFile = {
  content: string
  sha: string
}

type Props = {
  repoId: string
  filePath: string
  fields: Field[]
  file: GitHubFile | null
  userType: UserType
  label: string
}

function parseStructuredFile(file: GitHubFile | null, filePath: string): Record<string, unknown> {
  if (!file) return {}
  try {
    const ext = filePath.split('.').pop()?.toLowerCase()
    const parsed = ext === 'json' ? JSON.parse(file.content) : yaml.load(file.content)
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      ? parsed as Record<string, unknown>
      : {}
  } catch {
    return {}
  }
}

export default function DataFileEditor({ repoId, filePath, fields, file, label, userType }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(
    () => parseStructuredFile(file, filePath)
  )
  const [sha, setSha] = useState<string | null>(file?.sha ?? null)
  const [saving, setSaving] = useState(false)

  const handleChange = useCallback((fieldName: string, value: unknown) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/repos/${repoId}/data/${filePath}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: values, sha }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const json = await res.json()
      if (json.sha) setSha(json.sha)
      toast.success('Saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }, [repoId, filePath, values, sha])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold">{label}</h2>
          {userType === 'developer' && (
            <p className="text-xs text-muted-foreground mt-0.5">{filePath}</p>
          )}
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        {fields.map(field => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <FieldRenderer
              field={field}
              value={values[field.name] ?? ''}
              onChangeAction={value => handleChange(field.name, value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}