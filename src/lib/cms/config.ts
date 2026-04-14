import { getFile } from '@/lib/github/api'
import type { CMSConfig } from './types'

export async function fetchConfig(
  token: string,
  repo: string,
  configPath: string = 'cms.config.json'
): Promise<CMSConfig> {
  const file = await getFile(token, repo, configPath)
  if (!file) throw new Error(`Config file not found at ${configPath}`)
  const { content } = file

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
