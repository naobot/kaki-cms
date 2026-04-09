import { createClient } from '@/lib/supabase/server'
import { fetchConfig } from '@/lib/cms/config'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function ProjectLayout({
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

  return (
    <div className="flex min-h-screen">
      <Sidebar
        repoId={repoId}
        projectName={project.display_name}
        collections={config.collections}
      />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}