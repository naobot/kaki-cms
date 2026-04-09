import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()

  if (error === 'invalid_invite') {
    await supabase.auth.signOut()
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user && !error) redirect('/dashboard')

  async function signInWithGitHub() {
    'use server'
    const supabase = await createClient()
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo user:email',
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (data.url) redirect(data.url)
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      {error === 'invalid_invite' && (
        <p className="text-sm text-destructive text-center mb-4">
          This invite link is invalid or has expired. Please ask your administrator to send a new invite.
        </p>
      )}
      {!error &&
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Kaki CMS</CardTitle>
          <CardDescription>
            Sign in with your GitHub account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signInWithGitHub}>
            <Button type="submit" className="w-full">
              Login with GitHub
            </Button>
          </form>
        </CardContent>
      </Card>
      }
    </main>
  )
}