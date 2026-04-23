import { createClient } from '@/lib/supabase/server'
import { getDirectoryWithMeta, putFileBinary, deleteFile, GitHubAuthError } from '@/lib/github/api'
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
  if (!repo || !token) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  try {
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
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 })
  }
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
  if (!repo || !token) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!isImage(file.name)) {
    return NextResponse.json({ error: 'File type not supported' }, { status: 400 })
  }

  try {
    const config = await fetchConfig(token, repo.github_repo)
    const assetsPath = config.assets_path ?? 'public/assets/uploads'

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filePath = `${assetsPath}/${file.name}`

    await putFileBinary(token, repo.github_repo, filePath, buffer, `Upload ${file.name} via CMS`)

    const storedPath = '/' + filePath.replace(/^public\//, '')
    return NextResponse.json({ path: storedPath })
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 })
  }
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
  if (!repo || !token) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const { filePath, sha } = await request.json()
  const repoFilePath = 'public' + filePath

  try {
    await deleteFile({ repo: repo.github_repo, filePath: repoFilePath, sha, token })
    return new Response(null, { status: 200 })
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return NextResponse.json({ error: 'github_auth' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}