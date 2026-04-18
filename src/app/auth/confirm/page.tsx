'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash.substring(1) // strip the leading #
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    console.log('=== /auth/confirm (client) ===')
    console.log('type:', type)
    console.log('access_token present:', !!accessToken)
    console.log('refresh_token present:', !!refreshToken)

    if (!accessToken || !refreshToken) {
      console.log('Missing tokens in hash — redirecting to error')
      router.replace('/login?error=invalid_invite')
      return
    }

    const supabase = createClient()

    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ data, error }) => {
        console.log('setSession user:', data.session?.user?.email ?? null)
        console.log('setSession error:', error?.message ?? null)

        if (error || !data.session) {
          router.replace('/login?error=invalid_invite')
        } else {
          router.replace('/dashboard')
        }
      })
  }, [router])

  return <p>Confirming your invitation…</p>
}