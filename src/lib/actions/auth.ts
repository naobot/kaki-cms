'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const MIN_PASSWORD_LENGTH = 8

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'You must be signed in to change your password.' }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (newPassword === currentPassword) {
    return { error: 'New password must be different from your current password.' }
  }

  // Re-authenticate so a hijacked session alone can't change the password. This also satisfies
  // Supabase's "secure password change" recent-sign-in requirement when that setting is enabled.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { error: 'Current password is incorrect.' }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return { error: updateError.message }

  return { ok: true }
}
