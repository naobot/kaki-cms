import { createClient } from '@/lib/supabase/server'
import { getDirectoryWithMeta, putFileBinary, deleteFile } from '@/lib/github/api'
import { fetchConfig } from '@/lib/cms/config'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

function isImage(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? IMAGE_EXTENSIONS.includes(ext) : false
}

async function getRepoAndToken(id: string) {
  const serviceSupabase = createServiceClient()

  const { data: repo } = await serviceSupabase
    .from('repos')
    .select('github_repo, owner_id')
    .eq('id', id)
    .single()

  if (!repo) return { repo: null, token: null }

  const { data: tokenRow } = await serviceSupabase
    .from('github_tokens')
    .select('access_token')
    .eq('user_id', repo.owner_id)
    .single()

  return { repo, token: tokenRow?.access_token ?? null }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { repo, token } = await getRepoAndToken(id)
  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const config = await fetchConfig(token, repo.github_repo)
  const assetsPath = config.assets_path ?? 'public/assets/uploads'

  const files = await getDirectoryWithMeta(token, repo.github_repo, assetsPath)
  const images = files
    .filter(f => f.type === 'file' && isImage(f.name))
    .map(f => ({
      name: f.name,
      path: '/' + f.path.replace(/^public\//, ''),
      sha: f.sha,
      downloadUrl: f.downloadUrl,
    }))

  return NextResponse.json(images)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { repo, token } = await getRepoAndToken(id)
  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const config = await fetchConfig(token, repo.github_repo)
  const assetsPath = config.assets_path ?? 'public/assets/uploads'

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!isImage(file.name)) {
    return NextResponse.json({ error: 'File type not supported' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const filePath = `${assetsPath}/${file.name}`

  await putFileBinary(token, repo.github_repo, filePath, buffer, `Upload ${file.name} via CMS`)

  const storedPath = '/' + filePath.replace(/^public\//, '')

  return NextResponse.json({ path: storedPath })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { repo, token } = await getRepoAndToken(id)
  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const { filePath, sha } = await request.json()

  // filePath arrives as a public URL path e.g. /assets/uploads/foo.png
  // so we need to reconstruct the full repo path
  const repoFilePath = 'public' + filePath

  await deleteFile({ repo: repo.github_repo, filePath: repoFilePath, sha, token })

  return new Response(null, { status: 200 })
}