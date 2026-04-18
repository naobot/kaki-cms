import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getFile, putFile } from '@/lib/github/api'
import { NextRequest, NextResponse } from 'next/server'
import * as yaml from 'js-yaml'

type RouteParams = { params: Promise<{ id: string; path: string[] }> }

// ... inferFormat, parseDataFile, serialiseDataFile unchanged ...

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id, path } = await params
  const filePath = path.join('/')
  const format = inferFormat(filePath)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  const file = await getFile(tokenRow.access_token, repo.github_repo, filePath)
  if (!file) return NextResponse.json({ items: [], sha: null })

  try {
    const items = parseDataFile(file.content, format)
    return NextResponse.json({ items, sha: file.sha })
  } catch {
    return NextResponse.json({ error: 'File is not a flat string array' }, { status: 422 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id, path } = await params
  const filePath = path.join('/')
  const format = inferFormat(filePath)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  const { items, sha } = await request.json() as { items: string[], sha: string | null }
  const serialised = serialiseDataFile(items, format)

  await putFile(
    tokenRow.access_token,
    repo.github_repo,
    filePath,
    serialised,
    sha ?? undefined,
    sha ? `Update ${filePath} via CMS` : `Create ${filePath} via CMS`
  )

  return NextResponse.json({ success: true })
}