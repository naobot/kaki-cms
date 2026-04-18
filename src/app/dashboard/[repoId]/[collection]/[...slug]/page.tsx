import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchConfig } from '@/lib/cms/config'
import { getFile } from '@/lib/github/api'
import { parseDocument } from '@/lib/cms/parser'
import { redirect } from 'next/navigation'
import DocumentEditor from '@/components/DocumentEditor'

export default async function EditPage({
  params,
}: {
  params: Promise<{ repoId: string; collection: string; slug: string[] }>
}) {
  const { repoId, collection: collectionName, slug } = await params
  const isNew = slug.length === 1 && slug[0] === 'new'

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

  const collection = config.collections.find(c => c.name === collectionName)
  if (!collection) redirect(`/dashboard/${repoId}`)

  const document = isNew
    ? { frontmatter: {}, body: '', sha: '' }
    : await getFile(tokenRow.access_token, repo.github_repo, `${collection.path}/${slug.join('/')}.md`)
        .then(file => {
          if (!file) throw new Error(`Document not found: ${slug.join('/')}`)
          return parseDocument(file.content, file.sha)
        })

  return (
    <DocumentEditor
      repoId={repoId}
      githubRepo={repo.github_repo}
      collection={collection}
      document={document}
      filePath={isNew ? null : `${collection.path}/${slug.join('/')}.md`}
      isNew={isNew}
      collectionPath={collection.path}
    />
  )
}