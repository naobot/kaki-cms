import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ResetPasswordForm from './ResetPasswordForm'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Only sessions created by a recovery link may set a password without knowing the current one.
  // Send sessions that clearly came from a normal sign-in to the change-password page instead.
  const { data: claims } = await supabase.auth.getClaims()
  const authMethods = (claims?.claims.amr ?? []).map(entry =>
    typeof entry === 'string' ? entry : entry.method
  )
  const isRegularSignIn = authMethods.length > 0 &&
    authMethods.every(method => method === 'password' || method === 'oauth')

  if (isRegularSignIn) redirect('/account')

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Kaki CMS</CardTitle>
            <CardDescription>Choose a new password</CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
