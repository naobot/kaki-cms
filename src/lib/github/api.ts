const GITHUB_API = 'https://api.github.com'

export async function getFile(
  token: string,
  repo: string,        // "owner/repo-name"
  path: string         // "cms.config.json"
): Promise<{ content: string; sha: string }> {
  const response = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  // GitHub returns file contents as base64
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return { content, sha: data.sha }
}

export async function getDirectory(
  token: string,
  repo: string,
  path: string
): Promise<{ name: string; path: string; type: 'file' | 'dir' }[]> {
  const response = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`)

  const data = await response.json()
  return data.map((item: any) => ({
    name: item.name,
    path: item.path,
    type: item.type,
  }))
}

export async function getDirectoryWithMeta(
  token: string,
  repo: string,
  path: string
): Promise<{ name: string; path: string; sha: string; downloadUrl: string; type: 'file' | 'dir' }[]> {
  const response = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`)

  const data = await response.json()
  return data.map((item: any) => ({
    name: item.name,
    path: item.path,
    sha: item.sha,
    downloadUrl: item.download_url,
    type: item.type as 'file' | 'dir',
  }))
}

export async function putFile(
  token: string,
  repo: string,
  path: string,
  content: string,
  sha: string | undefined,
  message: string
): Promise<void> {
  const response = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
    }),
  })

  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`)
}

export async function putFileBinary(
  token: string,
  repo: string,
  path: string,
  buffer: Buffer,
  message: string
): Promise<void> {
  const response = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: buffer.toString('base64'),
    }),
  })

  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`)
}

export async function deleteFile({
  repo,
  filePath,
  sha,
  token,
}: {
  repo: string
  filePath: string
  sha: string
  token: string
}) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete ${filePath}`,
        sha,
      }),
    }
  )

  if (!res.ok) throw new Error(`GitHub delete failed: ${res.status}`)
}