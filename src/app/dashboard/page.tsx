import { createClient } from '@/lib/supabase/server'
import { fetchConfig } from '@/lib/cms/config'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: { session } } = await supabase.auth.getSession()
  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  const githubToken = tokenRow?.access_token

  console.log('provider_token:', githubToken)

  const { data: projects } = await supabase
    .from('projects')
    .select()
    .order('created_at', { ascending: false })

  const projectsWithConfig = await Promise.all(
    (projects ?? []).map(async (project) => {
      try {
        const config = await fetchConfig(githubToken!, project.github_repo, project.config_path)
        return { ...project, config }
      } catch (e) {
        return { ...project, config: null, error: (e as Error).message }
      }
    })
  )

  return (
    <main>
      <h1>Projects</h1>
      {projectsWithConfig.map(project => (
        <div key={project.id}>
          <p>{project.display_name}</p>
          <p>{project.github_repo}</p>
          {project.config
            ? <p>Collections: {project.config.collections.map((c: { label: any }) => c.label).join(', ')}</p>
            : <p>Config error: {project.error}</p>
          }
        </div>
      ))}
      <a href="/dashboard/projects/new">Add project</a>
    </main>
  )
}