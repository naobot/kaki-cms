import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  async function signInWithGitHub() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo user:email',
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (data.url) redirect(data.url)
  }

  return (
    <main>
      <form action={signInWithGitHub}>
        <button type="submit">Login with GitHub</button>
      </form>
    </main>
  )
}