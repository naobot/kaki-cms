'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cmsFetch } from '@/lib/cms/fetch'

export default function DeleteProjectButton({ repoId }: { repoId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isDeletePending, setIsDeletePending] = useState(false)

  async function handleDelete() {
    setIsDeletePending(true)
    try {
      const res = await cmsFetch(`/api/repos/${repoId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete project')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setIsDeletePending(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeletePending}>
          {isDeletePending ? 'Deleting...' : 'Confirm'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={isDeletePending}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  )
}