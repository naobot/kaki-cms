import { createClient } from '@/lib/supabase/server'
import { getDirectoryWithMeta, putFileBinary } from '@/lib/github/api'
import { fetchConfig } from '@/lib/cms/config'
import { NextRequest, NextResponse } from 'next/server'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

function isImage(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? IMAGE_EXTENSIONS.includes(ext) : false
}

async function getRepoAndToken(supabase: any, id: string) {
  const { data: repo } = await supabase
    .from('repos')
    .select('github_repo')
    .eq('id', id)
    .single()

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  return { repo, token: tokenRow?.access_token }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { repo, token } = await getRepoAndToken(supabase, id)
  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const config = await fetchConfig(token, repo.github_repo)
  const assetsPath = config.assets_path ?? 'public/assets/uploads'

  const files = await getDirectoryWithMeta(token, repo.github_repo, assetsPath)
  const images = files
    .filter(f => f.type === 'file' && isImage(f.name))
    .map(f => ({
      name: f.name,
      path: '/' + f.path.replace(/^public\//, ''),
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

  const { repo, token } = await getRepoAndToken(supabase, id)
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