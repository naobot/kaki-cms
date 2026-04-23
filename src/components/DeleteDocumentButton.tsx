'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cmsFetch } from '@/lib/cms/fetch'

type Props = {
  repoId: string
  filePath: string
  sha: string
  redirectTo: string
}

export default function DeleteDocumentButton({ repoId, filePath, sha, redirectTo }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isDeletePending, setIsDeletePending] = useState(false)

  async function handleDelete() {
    setIsDeletePending(true)
    try {
      const res = await cmsFetch(`/api/repos/${repoId}/content`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, sha }),
      })
      if (!res.ok) throw new Error('Failed to delete document')
      router.push(redirectTo)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setIsDeletePending(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" onClick={handleDelete} disabled={isDeletePending}>
          {isDeletePending ? 'Deleting...' : 'Confirm delete'}
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)} disabled={isDeletePending}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" onClick={() => setConfirming(true)}>
      Delete document
    </Button>
  )
}