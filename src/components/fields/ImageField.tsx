'use client'
import { useState } from 'react'
import { useRepo } from '@/lib/cms/context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import MediaLibrary from '@/components/MediaLibrary'
import type { Field } from '@/lib/cms/types'

type Props = {
  field: Field
  value: unknown
  onChangeAction: (value: string) => void
}

export default function ImageField({ field, value, onChangeAction }: Props) {
  const { repoId, githubRepo } = useRepo()
  const [open, setOpen] = useState(false)

  const currentPath = typeof value === 'string' ? value : ''

  const previewUrl = currentPath
    ? `https://raw.githubusercontent.com/${githubRepo}/HEAD/public${currentPath}`
    : null

  return (
    <div className="space-y-1">
      <Label>{field.label}</Label>
      <div className="flex gap-2 pt-1">
        <Input
          value={currentPath}
          onChange={e => onChangeAction(e.target.value)}
          placeholder="/assets/uploads/my-image.jpg"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
        >
          Browse
        </Button>
      </div>

      {previewUrl && (
        <img
          src={previewUrl}
          alt={field.label}
          className="mt-2 max-h-40 rounded border object-contain"
        />
      )}

      <MediaLibrary
        open={open}
        onOpenChangeAction={setOpen}
        repoId={repoId}
        onSelectAction={path => {
          onChangeAction(path)
          setOpen(false)
        }}
      />
    </div>
  )
}
