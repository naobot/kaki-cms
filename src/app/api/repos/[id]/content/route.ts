import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { deleteFile, GitHubAuthError, putFile } from '@/lib/github/api'
import { serialiseDocument } from '@/lib/cms/parser'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { frontmatter, body, sha, filePath, isNew } = await request.json()
  const serialised = serialiseDocument(frontmatter, body)

  try {
    await putFile(
      tokenRow.access_token,
      repo.github_repo,
      filePath,
      serialised,
      isNew ? undefined : sha,
      isNew ? `Create ${filePath} via CMS` : `Update ${filePath} via CMS`
    )
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { filePath, sha } = await request.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceSupabase = createServiceClient()

  const { data: repo } = await serviceSupabase
    .from('repos')
    .select('github_repo, owner_id')
    .eq('id', id)
    .single()

  if (!repo) return new Response('Repo not found', { status: 404 })

  const { data: tokenRow } = await serviceSupabase
    .from('github_tokens')
    .select('access_token')
    .eq('user_id', repo.owner_id)
    .single()

  if (!tokenRow) return new Response('No token found', { status: 404 })

  try {
    await deleteFile({ repo: repo.github_repo, filePath, sha, token: tokenRow.access_token })
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return new Response('Failed to delete', { status: 500 })
  }

  return new Response(null, { status: 200 })
}