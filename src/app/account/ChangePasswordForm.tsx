'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { changePassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import NewPasswordFields, { validateNewPassword } from '@/components/NewPasswordFields'

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
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
    const result = await changePassword(currentPassword, password)
    setStatus('idle')

    if ('error' in result) {
      setError(result.error)
      return
    }

    setCurrentPassword('')
    setPassword('')
    setConfirm('')
    toast.success('Password updated')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
        />
      </div>
      <NewPasswordFields
        password={password}
        confirm={confirm}
        onPasswordChange={setPassword}
        onConfirmChange={setConfirm}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button
        onClick={handleSubmit}
        disabled={!currentPassword || !password || !confirm || status === 'submitting'}
      >
        {status === 'submitting' ? 'Updating...' : 'Change password'}
      </Button>
    </div>
  )
}
