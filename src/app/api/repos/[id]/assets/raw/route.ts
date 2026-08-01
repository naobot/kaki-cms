import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchConfig } from '@/lib/cms/config'
import { getFileBinary, GitHubAuthError } from '@/lib/github/api'
import { assetContentType, DEFAULT_ASSETS_PATH, toRepoAssetPath } from '@/lib/cms/assets'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sitePath = request.nextUrl.searchParams.get('path')
  if (!sitePath) return NextResponse.json({ error: 'No path provided' }, { status: 400 })

  const serviceSupabase = createServiceClient()

  const { data: repo } = await serviceSupabase
    .from('repos')
    .select('github_repo, owner_id')
    .eq('id', id)
    .single()

  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const { data: tokenRow } = await serviceSupabase
    .from('github_tokens')
    .select('access_token')
    .eq('user_id', repo.owner_id)
    .single()

  if (!tokenRow) return NextResponse.json({ error: 'No token found' }, { status: 404 })

  try {
    const config = await fetchConfig(tokenRow.access_token, repo.github_repo)
    const assetsPath = config.assets_path ?? DEFAULT_ASSETS_PATH
    const repoPath = toRepoAssetPath(sitePath, assetsPath)

    // This route reads arbitrary paths from the repo, so it must only ever
    // reach inside the configured assets directory.
    if (repoPath.includes('..') || !repoPath.startsWith(`${assetsPath}/`)) {
      return NextResponse.json({ error: 'Path not allowed' }, { status: 403 })
    }

    const buffer = await getFileBinary(tokenRow.access_token, repo.github_repo, repoPath)
    if (!buffer) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': assetContentType(repoPath),
        'Content-Disposition': 'inline',
        // Assets are overwritten in place on re-upload, so keep this short.
        'Cache-Control': 'private, max-age=60',
        // Uploads can include SVG, which is script-capable when served from
        // our own origin.
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to load asset' }, { status: 500 })
  }
}
