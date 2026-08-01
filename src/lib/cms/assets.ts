export const DEFAULT_ASSETS_PATH = 'public/assets/uploads'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

export function assetContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  return (ext && MIME_TYPES[ext]) || 'application/octet-stream'
}

/**
 * Stored asset paths are site paths (`/assets/uploads/x.png`), which is what
 * gets written into content. Repos that serve from a `public/` directory keep
 * that segment out of the site path, so it has to be restored to address the
 * file in the repo. Repos without it (Jekyll, for example) map straight across.
 */
export function toRepoAssetPath(sitePath: string, assetsPath: string): string {
  const clean = sitePath.replace(/^\/+/, '')
  return assetsPath.startsWith('public/') ? `public/${clean}` : clean
}

/** Inverse of `toRepoAssetPath`. */
export function toSiteAssetPath(repoPath: string): string {
  return '/' + repoPath.replace(/^public\//, '')
}

/**
 * Assets are served through the CMS rather than from the deployed site so that
 * a just-uploaded image renders immediately, before the site has rebuilt — and
 * so previews work for private repos and for repos with no `base_url` set.
 */
export function assetProxyUrl(repoId: string, sitePath: string): string {
  return `/api/repos/${repoId}/assets/raw?path=${encodeURIComponent(sitePath)}`
}

const PROXY_PATTERN = /^\/api\/repos\/[^/]+\/assets\/raw\?path=(.+)$/

/** Recovers the stored site path from a proxy URL, for writing back to content. */
export function sitePathFromProxyUrl(src: string): string | null {
  const match = src.match(PROXY_PATTERN)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}
