import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ChangePasswordForm from './ChangePasswordForm'

const PROVIDER_LABELS: Record<string, string> = {
  github: 'GitHub',
  google: 'Google',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const providers = (user.identities ?? []).map(identity => identity.provider)
  const hasPassword = providers.includes('email')
  const oauthProviders = providers
    .filter(provider => provider !== 'email')
    .map(provider => PROVIDER_LABELS[provider] ?? provider)

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Account</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {hasPassword ? (
              <>
                <ChangePasswordForm />
                <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline">
                  Forgot your current password?
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                You sign in with {oauthProviders.join(' or ') || 'an external provider'}, so there&apos;s no password to change.
              </p>
            )}
          </CardContent>
        </Card>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  )
}
