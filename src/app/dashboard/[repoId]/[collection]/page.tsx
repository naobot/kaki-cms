import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchConfig } from '@/lib/cms/config'
import { getDirectory, getFile } from '@/lib/github/api'
import { parseDocument } from '@/lib/cms/parser'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import CollectionList from '@/components/CollectionList'

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ repoId: string; collection: string }>
}) {
  const { repoId, collection } = await params
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

  const collectionConfig = config.collections.find(c => c.name === collection)
  if (!collectionConfig) redirect(`/dashboard/${repoId}`)

  const files = await getDirectory(
    tokenRow.access_token,
    repo.github_repo,
    collectionConfig.path
  )

  const documents = files
    .filter(f => f.type === 'file' && f.name.endsWith('.md'))
    .map(f => ({ name: f.name, path: f.path, slug: f.name.replace('.md', '') }))

  const orderManifest = collectionConfig.orderable
    ? await getFile(tokenRow.access_token, repo.github_repo, `${collectionConfig.path}/_order.json`)
        .then(file => file ? JSON.parse(file.content) as string[] : null)
    : null

  const documentMeta = collectionConfig.publishable
    ? Object.fromEntries(
        await Promise.all(
          documents.map(async doc => {
            const file = await getFile(tokenRow.access_token, repo.github_repo, doc.path)
            const parsed = file ? parseDocument(file.content, file.sha) : null
            return [doc.slug, {
              published: parsed ? (parsed.frontmatter.published ?? true) : true,
              sha: parsed?.sha ?? null,
              body: parsed?.body ?? '',
              frontmatter: parsed?.frontmatter ?? {},
            }]
          })
        )
      )
    : {}

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{collectionConfig.label}</h1>
            {/*<p className="text-sm text-muted-foreground mt-1">{collectionConfig.path}</p>*/}
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

      <CollectionList
        repoId={repoId}
        collection={collection}
        collectionPath={collectionConfig.path}
        documents={documents}
        orderManifest={orderManifest}
        orderable={collectionConfig.orderable ?? false}
        publishable={collectionConfig.publishable ?? false}
        documentMeta={documentMeta}
      />
    </div>
  )
}