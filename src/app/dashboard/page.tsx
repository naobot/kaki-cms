import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteProjectButton from '@/components/DeleteProjectButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select()
    .order('created_at', { ascending: false })

  return (
    <main>
      <h1>Projects</h1>
      {(projects ?? []).map(project => (
        <div key={project.id}>
          <Link href={`/dashboard/${project.id}`}>
            <p>{project.display_name}</p>
          </Link>
          <p>{project.github_repo}</p>
          <DeleteProjectButton projectId={project.id} />
        </div>
      ))}
      <a href="/dashboard/projects/new">Add project</a>
    </main>
  )
}