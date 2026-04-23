import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getFile, putFile, GitHubAuthError } from '@/lib/github/api'
import { NextRequest, NextResponse } from 'next/server'
import * as yaml from 'js-yaml'

type RouteParams = { params: Promise<{ id: string; path: string[] }> }

function inferFormat(filePath: string): 'json' | 'yaml' {
  const ext = filePath.split('.').pop()?.toLowerCase()
  return ext === 'json' ? 'json' : 'yaml'
}

function parseDataFile(content: string, format: 'json' | 'yaml'): string[] {
  const parsed = format === 'json' ? JSON.parse(content) : yaml.load(content)
  if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
    throw new Error('Data file must be a flat array of strings')
  }
  return parsed
}

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

  let file
  try {
    file = await getFile(tokenRow.access_token, repo.github_repo, filePath)
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }

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

  const body = await request.json() as
    | { items: string[]; sha: string | null }
    | { data: Record<string, unknown>; sha: string | null }

  const payload = 'data' in body ? body.data : body.items
  const serialised = format === 'json'
    ? JSON.stringify(payload, null, 2)
    : yaml.dump(payload)

  try {
    const result = await putFile(
      tokenRow.access_token,
      repo.github_repo,
      filePath,
      serialised,
      body.sha ?? undefined,
      body.sha ? `Update ${filePath} via CMS` : `Create ${filePath} via CMS`
    )
    return NextResponse.json({ success: true, sha: result?.content?.sha ?? null })
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}