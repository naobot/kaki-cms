import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchConfig } from '@/lib/cms/config'
import { getUserType } from '@/lib/cms/user'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { RepoProvider } from '@/lib/cms/context'

export default async function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ repoId: string }>
}) {
  const { repoId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userType = await getUserType()
  const serviceSupabase = createServiceClient()

  const { data: repo } = await serviceSupabase
    .from('repos')
    .select()
    .eq('id', repoId)
    .single()

  const repos = userType === 'developer'
    ? await serviceSupabase
        .from('repos')
        .select('id, display_name')
        .eq('owner_id', user.id)
        .then(({ data }) => (data ?? []).map(r => ({ id: r.id, name: r.display_name })))
    : []

  if (!repo) redirect('/dashboard')

  const { data: tokenRow } = await serviceSupabase
    .from('github_tokens')
    .select('access_token')
    .eq('user_id', repo.owner_id)
    .single()

  if (!tokenRow) redirect('/dashboard')

  const config = await fetchConfig(
    tokenRow.access_token,
    repo.github_repo,
    repo.config_path
  )

  console.log('RepoProvider value:', { repo, accessToken: !!tokenRow?.access_token, userType })

  return (
    <div className="flex min-h-screen">
      <Sidebar
        repoId={repoId}
        projectName={repo.display_name}
        collections={config.collections}
        singletons={config.singletons}
        dataFiles={config.data_files ?? []}
        userType={userType}
        repos={repos}
      />
      <RepoProvider value={{ repo, config, accessToken: tokenRow.access_token, userType }}>
        <div className="flex-1 max-h-screen overflow-y-auto">
          {children}
        </div>
      </RepoProvider>
    </div>
  )
}