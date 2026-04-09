import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash') ?? searchParams.get('token')
  const type = (searchParams.get('type') as EmailOtpType | null) ?? 'invite'
  const repoId = searchParams.get('repo_id')

  if (token_hash && type) {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error) {
      if (repoId) {
        return NextResponse.redirect(`${origin}/edit/${repoId}`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }

    console.error('OTP verification error:', error)
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_invite`)
}