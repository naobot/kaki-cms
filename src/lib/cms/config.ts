import { getFile } from '@/lib/github/api'
import type { CMSConfig } from './types'

export async function fetchConfig(
  token: string,
  repo: string,
  configPath: string
): Promise<CMSConfig> {
  const { content } = await getFile(token, repo, configPath)

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error(`Failed to parse config file at ${configPath} — is it valid JSON?`)
  }

  // Basic sanity check — expand this as needed
  if (!parsed || typeof parsed !== 'object' || !('collections' in parsed)) {
    throw new Error(`Config file is missing a "collections" field`)
  }

  return parsed as CMSConfig
}
