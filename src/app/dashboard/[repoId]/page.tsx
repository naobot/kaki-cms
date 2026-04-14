import { createClient } from '@/lib/supabase/server'
import { fetchConfig } from '@/lib/cms/config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import InviteForm from '@/components/InviteForm'

export default async function RepoPage({
  params,
}: {
  params: Promise<{ repoId: string }>
}) {
  const { repoId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: repo } = await supabase
    .from('repos')
    .select()
    .eq('id', repoId)
    .single()

  if (!repo) redirect('/dashboard')

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  const config = await fetchConfig(
    tokenRow!.access_token,
    repo.github_repo,
    repo.config_path
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">{repo.display_name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{repo.github_repo}</p>
      </div>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Collections
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.collections.map(collection => (
              <Link key={collection.name} href={`/dashboard/${repoId}/${collection.name}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{collection.label}</CardTitle>
                    <CardDescription>{collection.path}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {config.singletons && config.singletons.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Pages
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {config.singletons.map(singleton => (
                <Link key={singleton.name} href={`/dashboard/${repoId}/singleton/${singleton.name}`}>
                  <Card className="hover:bg-accent transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-base">{singleton.label}</CardTitle>
                      <CardDescription>{singleton.path}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <InviteForm repoId={repoId} />
    </div>
  )
}