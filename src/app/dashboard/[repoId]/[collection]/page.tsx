import { createClient } from '@/lib/supabase/server'
import { fetchConfig } from '@/lib/cms/config'
import { getDirectory } from '@/lib/github/api'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ repoId: string; collection: string }>
}) {
  const { repoId, collection } = await params
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

  const collectionConfig = config.collections.find(c => c.name === collection)
  if (!collectionConfig) redirect(`/dashboard/${repoId}`)

  const files = await getDirectory(
    tokenRow!.access_token,
    repo.github_repo,
    collectionConfig.path
  )

  const documents = files.filter(f => f.type === 'file' && f.name.endsWith('.md'))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{collectionConfig.label}</h1>
            <p className="text-sm text-muted-foreground mt-1">{collectionConfig.path}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href={`/dashboard/${repoId}`}>← Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/${repoId}/${collection}/new`}>
              New document
            </Link>
          </Button>
        </div>
      </div>
      {documents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">No documents yet</p>
          <Button asChild variant="outline">
            <Link href={`/dashboard/${repoId}/${collection}/new`}>
              Create your first document
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-md divide-y">
          {documents.map(doc => (
            <Link
              key={doc.path}
              href={`/dashboard/${repoId}/${collection}/${doc.name.replace('.md', '')}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">
                {doc.name.replace('.md', '')}
              </span>
              <span className="text-xs text-muted-foreground">Edit →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}