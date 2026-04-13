'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DeleteProjectButton({ repoId }: { repoId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    await fetch(`/api/repos/${repoId}`, { method: 'DELETE' })
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          Confirm
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
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