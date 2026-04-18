import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchConfig } from '@/lib/cms/config'
import { getFile } from '@/lib/github/api'
import { parseDocument } from '@/lib/cms/parser'
import { redirect } from 'next/navigation'
import SingletonEditor from '@/components/SingletonEditor'

export default async function SingletonPage({
  params,
}: {
  params: Promise<{ repoId: string; name: string }>
}) {
  const { repoId, name } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceSupabase = createServiceClient()

  const { data: repo } = await serviceSupabase
    .from('repos')
    .select()
    .eq('id', repoId)
    .single()

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

  const singleton = config.singletons?.find(s => s.name === name)
  if (!singleton) redirect(`/dashboard/${repoId}`)

  const file = await getFile(tokenRow.access_token, repo.github_repo, singleton.path)
  if (!file) redirect(`/dashboard/${repoId}`)

  const document = parseDocument(file.content, file.sha)

  return (
    <SingletonEditor
      repoId={repoId}
      githubRepo={repo.github_repo}
      singleton={singleton}
      document={document}
      filePath={singleton.path}
    />
  )
}