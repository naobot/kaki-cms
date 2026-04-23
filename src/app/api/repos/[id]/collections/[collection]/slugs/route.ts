import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchConfig } from '@/lib/cms/config'
import { getDirectory, GitHubAuthError } from '@/lib/github/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; collection: string }> }
) {
  const { id, collection } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceSupabase = createServiceClient()

  const { data: repo } = await serviceSupabase
    .from('repos').select().eq('id', id).single()
  if (!repo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: tokenRow } = await serviceSupabase
    .from('github_tokens').select('access_token').eq('user_id', repo.owner_id).single()
  if (!tokenRow) return NextResponse.json({ error: 'No token' }, { status: 403 })

  try {
    const config = await fetchConfig(tokenRow.access_token, repo.github_repo, repo.config_path)
    const collectionConfig = config.collections.find(c => c.name === collection)
    if (!collectionConfig) return NextResponse.json({ error: 'Collection not found' }, { status: 404 })

    const files = await getDirectory(tokenRow.access_token, repo.github_repo, collectionConfig.path)
    const slugs = files
      .filter(f => f.type === 'file' && f.name.endsWith('.md'))
      .map(f => f.name.replace(/\.md$/, ''))

    return NextResponse.json(slugs)
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch slugs' }, { status: 500 })
  }
}