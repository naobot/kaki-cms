'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthConfirmPage() {
  const router = useRouter()
  const hasRun = useRef(false)

  useEffect(() => {
    // The code/token in the URL is single-use — guard against processing it twice (e.g. an
    // effect re-run), which would fail the second time and sign out the session the first run just created.
    if (hasRun.current) return
    hasRun.current = true

    const supabase = createClient()

    // Password recovery uses the PKCE flow (the browser client defaults to it), which
    // redirects here with a `code` query param instead of hash-fragment tokens. Admin-triggered
    // invites don't support PKCE, so they still arrive as hash tokens (handled below).
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error || !data.session) {
          router.replace('/login?error=invalid_invite')
        } else {
          router.replace('/auth/reset-password')
        }
      })
      return
    }

    const hash = window.location.hash.substring(1) // strip the leading #
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=invalid_invite')
      return
    }

    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ data, error }) => {
        if (error || !data.session) {
          router.replace('/login?error=invalid_invite')
        } else {
          router.replace('/auth/set-password')
        }
      })
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Kaki CMS</CardTitle>
            <CardDescription>Confirming your registration...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  )
}