'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InviteForm({ repoId }: { repoId: string }) {
  const [email, setEmail] = useState('')
  const [justSentEmail, setJustSentEmail] = useState<string|null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('Something went wrong. Please try again.')

  async function handleInvite() {
    console.log('✉️ Sending invite')
    setStatus('sending')
    const res = await fetch(`/api/repos/${repoId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setStatus('sent')
      setJustSentEmail(email)
      setEmail('')
    } else {
      const body = await res.json()
      setErrorMsg(body.error ?? 'Something went wrong. Please try again.')
      setStatus('error')
      setJustSentEmail(null)
    }
  }

  return (
    <div className="mt-8 border rounded-md p-6">
      <h2 className="text-base font-semibold mb-4">Invite editor</h2>
      <div className="flex gap-2 items-end">
        <div className="space-y-1 flex-1">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="client@example.com"
          />
        </div>
        <Button
          onClick={handleInvite}
          disabled={Boolean(!email || status === 'sending')}
        >
          {status === 'sending' ? 'Sending...' : 'Send invite'}
        </Button>
      </div>
      {status === 'sent' && (
        <p className="text-sm text-muted-foreground mt-2">
          Invite sent to {justSentEmail}
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-destructive mt-2">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
