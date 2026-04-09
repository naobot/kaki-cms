import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage() {
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
    </main>
  )
}