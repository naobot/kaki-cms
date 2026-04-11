import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const repoId = searchParams.get('repo_id')
  const error = searchParams.get('error')

  console.log('=== /auth/confirm ===')
  console.log('All params:', Object.fromEntries(searchParams.entries()))
  console.log('error param:', error)
  console.log('repoId param:', repoId)

  if (error) {
    console.log('Error from Supabase:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/login?error=invalid_invite`)
  }

  const supabase = await createClient()
  const { data: { user }, error: sessionError } = await supabase.auth.getUser()

  console.log('Session user:', user?.email ?? null)
  console.log('Session error:', sessionError?.message ?? null)

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=invalid_invite`)
  }

  if (repoId) {
    return NextResponse.redirect(`${origin}/dashboard/${repoId}`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}