'use client'
import { useState, useEffect, useCallback } from 'react'
import type { FieldProps } from './types'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useRepo } from '@/lib/cms/context'

export default function MultiselectField({ field, value, onChangeAction }: FieldProps<string[]>) {
  const selected = value ?? []
  const { repoId } = useRepo()

  const [options, setOptions] = useState<string[]>(field.options ?? [])
  const [sha, setSha] = useState<string | null>(null)
  const [manageOpen, setManageOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [managedItems, setManagedItems] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch options from data_file if declared
  useEffect(() => {
    if (!field.data_file) return
    fetch(`/api/repos/${repoId}/data/${field.data_file}`)
      .then(res => res.json())
      .then(({ items, sha }) => {
        setOptions(items)
        setSha(sha)
      })
  }, [repoId, field.data_file])

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChangeAction(selected.filter(v => v !== option))
    } else {
      onChangeAction([...selected, option])
    }
  }

  const openManage = useCallback(() => {
    setManagedItems([...options])
    setDraft('')
    setManageOpen(true)
  }, [options])

  const addManagedItem = useCallback(() => {
    const trimmed = draft.trim()
    if (!trimmed || managedItems.includes(trimmed)) return
    setManagedItems(prev => [...prev, trimmed])
    setDraft('')
  }, [draft, managedItems])

  const removeManagedItem = useCallback((item: string) => {
    setManagedItems(prev => prev.filter(i => i !== item))
  }, [])

  const handleSave = useCallback(async () => {
    if (!field.data_file) return
    setSaving(true)

    const response = await fetch(`/api/repos/${repoId}/data/${field.data_file}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: managedItems, sha }),
    })

    if (response.ok) {
      setOptions(managedItems)
      // Remove any selected values that no longer exist in options
      const stillSelected = selected.filter(v => managedItems.includes(v))
      if (stillSelected.length !== selected.length) {
        onChangeAction(stillSelected)
      }
    }

    setSaving(false)
    setManageOpen(false)
  }, [repoId, field.data_file, managedItems, sha, selected, onChangeAction])

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        {field.data_file && (
          <button
            onClick={openManage}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Manage options"
          >
            <Settings size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-1">
        {options.length === 0 && (
          <p className="text-sm text-muted-foreground">No options yet — manage to add some</p>
        )}
        {options.map(option => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={`${field.name}-${option}`}
              checked={selected.includes(option)}
              onCheckedChange={() => toggle(option)}
            />
            <Label htmlFor={`${field.name}-${option}`} className="font-normal cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </div>

      {field.data_file && (
        <Dialog open={manageOpen} onOpenChange={setManageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage {field.label}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-2 my-2">
              {managedItems.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">No items yet</p>
              )}
              {managedItems.map(item => (
                <div key={item} className="flex items-center gap-2 border rounded-md px-3 py-2">
                  <span className="text-sm flex-1">{item}</span>
                  <button
                    onClick={() => removeManagedItem(item)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManagedItem()}
                placeholder={`Add a new ${field.label.toLowerCase()}…`}
              />
              <Button
                variant="outline"
                onClick={addManagedItem}
                disabled={!draft.trim() || managedItems.includes(draft.trim())}
              >
                Add
              </Button>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setManageOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}