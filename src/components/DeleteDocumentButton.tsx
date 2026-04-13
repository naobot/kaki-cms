'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

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
    await fetch(`/api/repos/${repoId}/content`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, sha }),
    })
    router.push(redirectTo)
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" onClick={handleDelete} disabled={isDeletePending}>
          {isDeletePending ? <>Deleting...</> : <>Confirm delete</>}
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
