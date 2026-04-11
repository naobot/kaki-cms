import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import GitHubLoginButton from '@/components/GitHubLoginButton'
import EmailLoginForm from '@/components/EmailLoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()

  if (error === 'invalid_invite') {
    await supabase.auth.signOut()
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user && !error) redirect('/dashboard')

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {error === 'invalid_invite' && (
          <p className="text-sm text-destructive text-center">
            This invite link is invalid or has expired. Please ask your administrator to send a new invite.
          </p>
        )}
        {error === 'no_repo' && (
          <p className="text-sm text-destructive text-center">
            Your account is not associated with any repo. Please contact your administrator.
          </p>
        )}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Kaki CMS</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
                <TabsTrigger value="developer" className="flex-1">Developer</TabsTrigger>
              </TabsList>
              <TabsContent value="editor">
                <EmailLoginForm />
              </TabsContent>
              <TabsContent value="developer">
                <GitHubLoginButton />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}