import { createClient } from '@/lib/supabase/server'
import { deleteFile, putFile } from '@/lib/github/api'
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

  const { data: project } = await supabase
    .from('repos')
    .select()
    .eq('id', id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  const { frontmatter, body, sha, filePath, isNew } = await request.json()

  const serialised = serialiseDocument(frontmatter, body)

  await putFile(
    tokenRow!.access_token,
    project.github_repo,
    filePath,
    serialised,
    isNew ? undefined : sha,
    isNew ? `Create ${filePath} via CMS` : `Update ${filePath} via CMS`
  )

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

  const { data: repo } = await supabase
    .from('repos')
    .select('github_repo')
    .eq('id', id)
    .single()

  if (!repo) return new Response('Repo not found', { status: 404 })

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  await deleteFile({ repo: repo.github_repo, filePath, sha, token: tokenRow!.access_token })

  return new Response(null, { status: 200 })
}