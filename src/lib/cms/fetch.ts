import { createClient } from '@/lib/supabase/client'

export class GitHubAuthError extends Error {
  constructor() {
    super('GitHub authorisation lost — please reconnect your GitHub account')
    this.name = 'GitHubAuthError'
  }
}

export async function cmsFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options)

  if (res.status === 401) {
    const body = await res.clone().json().catch(() => null)
    if (body?.error === 'github_auth') {
      // Clear the stale token and redirect to GitHub OAuth
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      throw new GitHubAuthError()
    }
  }

  return res
}