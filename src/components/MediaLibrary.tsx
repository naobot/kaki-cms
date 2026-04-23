'use client'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from 'lucide-react'

type Asset = {
  name: string
  path: string
  sha: string
  downloadUrl: string
}

type Props = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  repoId: string
  onSelectAction: (path: string) => void
}

export default function MediaLibrary({ open, onOpenChangeAction, repoId, onSelectAction }: Props) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`/api/repos/${repoId}/assets`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load media library')
        return res.json()
      })
      .then(data => setAssets(data))
      .catch(() => toast.error('Failed to load media library'))
      .finally(() => setLoading(false))
  }, [open, repoId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/repos/${repoId}/assets`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')

      const { path } = await res.json()

      const refreshed = await fetch(`/api/repos/${repoId}/assets`)
      if (!refreshed.ok) throw new Error('Failed to refresh assets')
      setAssets(await refreshed.json())

      if (fileInputRef.current) fileInputRef.current.value = ''
      onSelectAction(path)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(e: React.MouseEvent, asset: Asset) {
    e.stopPropagation()
    setDeleting(prev => ({ ...prev, [asset.path]: true }))
    try {
      const res = await fetch(`/api/repos/${repoId}/assets`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: asset.path, sha: asset.sha }),
      })
      if (!res.ok) throw new Error('Failed to delete image')
      setAssets(prev => prev.filter(a => a.path !== asset.path))
      toast.success('Image deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setDeleting(prev => ({ ...prev, [asset.path]: false }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
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
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No images yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {assets.map(asset => (
              <button
                key={asset.path}
                onClick={() => onSelectAction(asset.path)}
                className="group relative aspect-square rounded border bg-muted hover:border-primary transition-colors cursor-pointer"
              >
                <img
                  src={asset.downloadUrl}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {asset.name}
                </div>
                <div
                  role="button"
                  onClick={e => handleDelete(e, asset)}
                  className={`absolute -top-2 -right-2 rounded-full bg-background border shadow-sm p-0.5 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white hover:border-destructive ${deleting[asset.path] ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <X size={12} />
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}