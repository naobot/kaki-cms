import { createClient } from '@/lib/supabase/server'

export type UserType = 'developer' | 'editor'

export async function getUserType(): Promise<UserType> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: ownedRepos } = await supabase
    .from('repos')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)

  console.log('user', user)
  console.log('ownedRepos', ownedRepos)

  return ownedRepos && ownedRepos.length > 0 ? 'developer' : 'editor'
}

export async function getEditorRepoId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return membership?.project_id ?? null
}
