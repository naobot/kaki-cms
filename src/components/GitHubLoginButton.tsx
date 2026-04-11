import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function GitHubLoginButton() {
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
    <form action={signInWithGitHub}>
      <Button type="submit" className="w-full">
        Login with GitHub
      </Button>
    </form>
  )
}
