import { createClient } from '@/lib/supabase/server'
import { fetchConfig } from '@/lib/cms/config'
import { getDirectory } from '@/lib/github/api'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ repoId: string; collection: string }>
}) {
  const { repoId, collection } = await params
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

  const collectionConfig = config.collections.find(c => c.name === collection)
  if (!collectionConfig) redirect(`/dashboard/${repoId}`)

  const files = await getDirectory(
    tokenRow!.access_token,
    project.github_repo,
    collectionConfig.path
  )

  const documents = files.filter(f => f.type === 'file' && f.name.endsWith('.md'))

  return (
    <main>
      <h1>{collectionConfig.label}</h1>
      <Link href={`/dashboard/${repoId}`}>← Back</Link>
      <ul>
        {documents.map(doc => (
          <li key={doc.path}>
            <Link href={`/dashboard/${repoId}/${collection}/${doc.name.replace('.md', '')}`}>
              {doc.name.replace('.md', '')}
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/dashboard/${repoId}/${collection}/new`}>
        + New document
      </Link>
    </main>
  )
}