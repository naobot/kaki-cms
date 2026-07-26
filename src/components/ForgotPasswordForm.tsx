'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle')

  async function handleSubmit() {
    setError(null)
    setStatus('submitting')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    })

    if (resetError) {
      setError(resetError.message)
      setStatus('idle')
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for {email}, we&apos;ve sent a password reset link to it.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button
        onClick={handleSubmit}
        disabled={Boolean(status === 'submitting' || !email)}
      >
        {status === 'submitting' ? 'Sending...' : 'Send reset link'}
      </Button>
    </div>
  )
}
