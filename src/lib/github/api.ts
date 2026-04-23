const GITHUB_API = 'https://api.github.com'

export class GitHubAuthError extends Error {
  constructor() {
    super('GitHub token invalid or revoked')
    this.name = 'GitHubAuthError'
  }
}

async function githubFetch(token: string, url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      ...options?.headers,
    },
  })
  if (response.status === 401) throw new GitHubAuthError()
  return response
}

export async function getFile(
  token: string,
  repo: string,
  path: string
): Promise<{ content: string; sha: string } | null> {
  const response = await githubFetch(token, `${GITHUB_API}/repos/${repo}/contents/${path}`)

  if (response.status === 404) return null

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return { content, sha: data.sha }
}

export async function getDirectory(
  token: string,
  repo: string,
  path: string
): Promise<{ name: string; path: string; type: 'file' | 'dir' }[]> {
  const response = await githubFetch(token, `${GITHUB_API}/repos/${repo}/contents/${path}`)

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
  const response = await githubFetch(token, `${GITHUB_API}/repos/${repo}/contents/${path}`)

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
): Promise<{ content: { sha: string } }> {
  const response = await githubFetch(token, `${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
    }),
  })

  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`)
  return response.json()
}

export async function putFileBinary(
  token: string,
  repo: string,
  path: string,
  buffer: Buffer,
  message: string
): Promise<void> {
  const response = await githubFetch(token, `${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
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
  const res = await githubFetch(
    token,
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: 'DELETE',
      headers: {
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