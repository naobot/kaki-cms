import { getFile, putFile } from '@/lib/github/api'

function dirOf(filePath: string): string {
  return filePath.slice(0, filePath.lastIndexOf('/'))
}

function slugOf(filePath: string): string {
  return filePath.slice(filePath.lastIndexOf('/') + 1).replace(/\.md$/, '')
}

/**
 * Keeps `_order.json` in sync when a document is renamed. The manifest stores
 * slugs, so a renamed document would otherwise drop out of the saved order and
 * get appended to the end of the list.
 */
export async function renameInOrderManifest(
  token: string,
  repo: string,
  oldFilePath: string,
  newFilePath: string
): Promise<void> {
  const dir = dirOf(oldFilePath)
  if (dir !== dirOf(newFilePath)) return

  const existing = await getFile(token, repo, `${dir}/_order.json`)
  if (!existing) return

  let slugs: unknown
  try {
    slugs = JSON.parse(existing.content)
  } catch {
    return
  }
  if (!Array.isArray(slugs)) return

  const oldSlug = slugOf(oldFilePath)
  if (!slugs.includes(oldSlug)) return

  const newSlug = slugOf(newFilePath)
  const updated = slugs.map(s => (s === oldSlug ? newSlug : s))

  await putFile(
    token,
    repo,
    `${dir}/_order.json`,
    JSON.stringify(updated, null, 2),
    existing.sha,
    'chore: update collection order after rename'
  )
}
