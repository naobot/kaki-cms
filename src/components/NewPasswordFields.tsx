'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const MIN_PASSWORD_LENGTH = 8

export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (password !== confirm) {
    return 'Passwords do not match.'
  }

  return null
}

type Props = {
  password: string
  confirm: string
  onPasswordChange: (value: string) => void
  onConfirmChange: (value: string) => void
  passwordLabel?: string
}

export default function NewPasswordFields({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  passwordLabel = 'New password',
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={e => onConfirmChange(e.target.value)}
        />
      </div>
    </>
  )
}
