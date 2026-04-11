import { createClient } from '@/lib/supabase/server'
import { getUserType, getEditorRepoId } from '@/lib/cms/user'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const userType = await getUserType()

  if (userType === 'developer') {
    redirect('/dashboard')
  } else {
    const repoId = await getEditorRepoId()
    if (repoId) {
      redirect(`/dashboard/${repoId}`)
    } else {
      redirect('/login?error=no_repo')
    }
  }
}