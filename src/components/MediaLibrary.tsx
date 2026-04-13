'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Asset = {
  name: string
  path: string
  downloadUrl: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  repoId: string
  onSelect: (path: string) => void
}

export default function MediaLibrary({ open, onOpenChange, repoId, onSelect }: Props) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`/api/repos/${repoId}/assets`)
      .then(res => res.json())
      .then(data => setAssets(data))
      .finally(() => setLoading(false))
  }, [open, repoId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`/api/repos/${repoId}/assets`, {
      method: 'POST',
      body: formData,
    })

    const { path } = await res.json()

    // refresh the asset list and select the newly uploaded file immediately
    const refreshed = await fetch(`/api/repos/${repoId}/assets`).then(r => r.json())
    setAssets(refreshed)
    setUploading(false)

    // reset input so the same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = ''

    onSelect(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Uploading...' : 'Upload image'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading...</p>
        ) : assets.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No images yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[60vh]">
            {assets.map(asset => (
              <button
                key={asset.path}
                onClick={() => onSelect(asset.path)}
                className="group relative aspect-square overflow-hidden rounded border bg-muted hover:border-primary transition-colors"
              >
                <img
                  src={asset.downloadUrl}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {asset.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
