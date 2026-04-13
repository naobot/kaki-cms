import { createClient } from '@/lib/supabase/server'
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

  const { data: project } = await supabase
    .from('repos')
    .select()
    .eq('id', repoId)
    .single()

  if (!project) redirect('/dashboard')

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  const config = await fetchConfig(
    tokenRow!.access_token,
    project.github_repo,
    project.config_path
  )

  const collection = config.collections.find(c => c.name === collectionName)
  if (!collection) redirect(`/dashboard/${repoId}`)

  const document = isNew
    ? { frontmatter: {}, body: '', sha: '' }
    : await getFile(tokenRow!.access_token, project.github_repo, `${collection.path}/${slug.join('/')}.md`)
        .then(({ content, sha }) => parseDocument(content, sha))

  return (
    <DocumentEditor
      repoId={repoId}
      githubRepo={project.github_repo}
      collection={collection}
      document={document}
      filePath={isNew ? null : `${collection.path}/${slug.join('/')}.md`}
      isNew={isNew}
      collectionPath={collection.path}
    />
  )
}