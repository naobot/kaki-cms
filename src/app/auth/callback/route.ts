import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session?.provider_token) {
      await supabase.from('github_tokens').upsert({
        user_id: data.session.user.id,
        access_token: data.session.provider_token,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}