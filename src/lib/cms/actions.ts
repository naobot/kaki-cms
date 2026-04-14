'use server'

import { createClient } from '@/lib/supabase/server'
import { getFile, putFile } from '@/lib/github/api'

export async function saveOrder(
  repoId: string,
  collectionPath: string,
  slugs: string[]
): Promise<void> {
  const supabase = await createClient()

  const { data: repo } = await supabase
    .from('repos')
    .select()
    .eq('id', repoId)
    .single()

  if (!repo) throw new Error('Repo not found')

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  if (!tokenRow) throw new Error('No GitHub token found')

  const orderPath = `${collectionPath}/_order.json`

  // We need the existing sha if the file already exists, otherwise GitHub will reject the put
  const existing = await getFile(tokenRow.access_token, repo.github_repo, orderPath)

  await putFile(
    tokenRow.access_token,
    repo.github_repo,
    orderPath,
    JSON.stringify(slugs, null, 2),
    existing?.sha,
    'chore: update collection order'
  )
}