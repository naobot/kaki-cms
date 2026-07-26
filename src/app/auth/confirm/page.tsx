'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthConfirmPage() {
  const router = useRouter()
  const handled = useRef(false)

  useEffect(() => {
    const supabase = createClient()

    // The browser client auto-processes the invite/recovery link in the URL as soon as it's
    // created (detectSessionInUrl). Don't exchange the code/tokens ourselves here — that would
    // race the SDK's own exchange and fail (the code/token is single-use). Instead, just listen
    // for the event its auto-processing fires once done.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (handled.current) return

      if (event === 'PASSWORD_RECOVERY') {
        handled.current = true
        router.replace('/auth/reset-password')
      } else if (event === 'SIGNED_IN' && session) {
        handled.current = true
        router.replace('/auth/set-password')
      }
    })

    // A genuinely invalid/expired link never fires an event above — give the SDK's
    // auto-detection a moment to run, then fall back to the error page.
    const timeout = setTimeout(() => {
      if (!handled.current) {
        handled.current = true
        router.replace('/login?error=invalid_invite')
      }
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
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