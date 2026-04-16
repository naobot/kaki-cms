import { createClient } from '@/lib/supabase/server'
import { getFile, putFile } from '@/lib/github/api'
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

function serialiseDataFile(items: string[], format: 'json' | 'yaml'): string {
  return format === 'json'
    ? JSON.stringify(items, null, 2)
    : yaml.dump(items)
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id, path } = await params
  const filePath = path.join('/')
  const format = inferFormat(filePath)

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: repo } = await supabase
    .from('repos')
    .select('github_repo')
    .eq('id', id)
    .single()

  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  const file = await getFile(tokenRow!.access_token, repo.github_repo, filePath)

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

  const { data: repo } = await supabase
    .from('repos')
    .select('github_repo')
    .eq('id', id)
    .single()

  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  const { items, sha } = await request.json() as { items: string[], sha: string | null }

  const serialised = serialiseDataFile(items, format)

  await putFile(
    tokenRow!.access_token,
    repo.github_repo,
    filePath,
    serialised,
    sha ?? undefined,
    sha ? `Update ${filePath} via CMS` : `Create ${filePath} via CMS`
  )

  return NextResponse.json({ success: true })
}