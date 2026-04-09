import { createClient } from '@/lib/supabase/server'
import { fetchConfig } from '@/lib/cms/config'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select()
    .eq('id', projectId)
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

  return (
    <main>
      <h1>{project.display_name}</h1>
      <h2>Collections</h2>
      <ul>
        {config.collections.map(collection => (
          <li key={collection.name}>
            <Link href={`/dashboard/${projectId}/${collection.name}`}>
              {collection.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}