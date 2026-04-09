'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    router.refresh()
  }

  if (confirming) {
    return (
      <>
        <span>Are you sure?</span>
        <button onClick={handleDelete}>Yes, delete</button>
        <button onClick={() => setConfirming(false)}>Cancel</button>
      </>
    )
  }

  return <button onClick={() => setConfirming(true)}>Delete</button>
}