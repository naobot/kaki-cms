'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import NewPasswordFields, { validateNewPassword } from '@/components/NewPasswordFields'

export default function SetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')

  async function handleSubmit() {
    setError(null)

    const validationError = validateNewPassword(password, confirm)
    if (validationError) {
      setError(validationError)
      return
    }

    setStatus('submitting')
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setStatus('idle')
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ password_set: true })
      .eq('user_id', (await supabase.auth.getUser()).data.user!.id)

    if (profileError) {
      setError('Password set, but failed to update profile. Please contact your administrator.')
      setStatus('idle')
      return
    }

    router.replace('/dashboard')
  }

  return (
    <div className="flex flex-col gap-4">
      <NewPasswordFields
        password={password}
        confirm={confirm}
        onPasswordChange={setPassword}
        onConfirmChange={setConfirm}
        passwordLabel="Password"
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button
        onClick={handleSubmit}
        disabled={!password || !confirm || status === 'submitting'}
      >
        {status === 'submitting' ? 'Setting password...' : 'Set password'}
      </Button>
    </div>
  )
}