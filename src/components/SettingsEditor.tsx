'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'
import type { UserType } from '@/lib/cms/user'

type DataFileState = {
  path: string
  label: string
  items: string[]
  sha: string | null
}

export default function SettingsEditor({ repoId, dataFiles, userType }: {
  repoId: string
  dataFiles: DataFileState[]
  userType: UserType
}) {
  const [files, setFiles] = useState<DataFileState[]>(dataFiles)
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(dataFiles.map(f => [f.path, '']))
  )
  const [saving, setSaving] = useState<Record<string, boolean>>(
    Object.fromEntries(dataFiles.map(f => [f.path, false]))
  )

  const addItem = useCallback((path: string) => {
    const draft = drafts[path].trim()
    if (!draft) return
    setFiles(prev => prev.map(f =>
      f.path === path ? { ...f, items: [...f.items, draft] } : f
    ))
    setDrafts(prev => ({ ...prev, [path]: '' }))
  }, [drafts])

  const removeItem = useCallback((path: string, index: number) => {
    setFiles(prev => prev.map(f =>
      f.path === path ? { ...f, items: f.items.filter((_, i) => i !== index) } : f
    ))
  }, [])

  const handleSave = useCallback(async (path: string) => {
    const file = files.find(f => f.path === path)
    if (!file) return

    setSaving(prev => ({ ...prev, [path]: true }))

    await fetch(`/api/repos/${repoId}/data/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: file.items, sha: file.sha }),
    })

    setSaving(prev => ({ ...prev, [path]: false }))
  }, [repoId, files])

  return (
    <div className="flex flex-col gap-8">
      {files.map((file, fileIndex) => (
        <div key={file.path}>
          {fileIndex > 0 && <Separator className="mb-8" />}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold">{file.label}</h2>
              {userType === 'developer' && (
                <p className="text-xs text-muted-foreground mt-0.5">{file.path}</p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => handleSave(file.path)}
              disabled={saving[file.path]}
            >
              {saving[file.path] ? 'Saving…' : 'Save'}
            </Button>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {file.items.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No items yet</p>
            )}
            {file.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 border rounded-md px-3 py-2">
                <span className="text-sm flex-1">{item}</span>
                <button
                  onClick={() => removeItem(file.path, index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={drafts[file.path]}
              onChange={e => setDrafts(prev => ({ ...prev, [file.path]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addItem(file.path)}
              placeholder={`Add a new ${file.label.toLowerCase()} item…`}
            />
            <Button
              variant="outline"
              onClick={() => addItem(file.path)}
              disabled={!drafts[file.path].trim()}
            >
              Add
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}