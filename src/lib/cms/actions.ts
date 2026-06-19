'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getFile, putFile } from '@/lib/github/api'

export async function saveOrder(
  repoId: string,
  collectionPath: string,
  slugs: string[]
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const serviceSupabase = createServiceClient()

  const { data: repo } = await serviceSupabase
    .from('repos')
    .select('github_repo, owner_id')
    .eq('id', repoId)
    .single()

  if (!repo) throw new Error('Repo not found')

  const { data: tokenRow } = await serviceSupabase
    .from('github_tokens')
    .select('access_token')
    .eq('user_id', repo.owner_id)
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