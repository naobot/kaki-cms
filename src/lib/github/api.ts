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