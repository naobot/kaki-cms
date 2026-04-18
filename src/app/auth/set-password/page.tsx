import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import SetPasswordForm from './SetPasswordForm'

export default async function SetPasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('password_set')
    .eq('user_id', user.id)
    .single()

  if (profile?.password_set) redirect('/settings')

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Kaki CMS</CardTitle>
            <CardDescription>Set a password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <SetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}