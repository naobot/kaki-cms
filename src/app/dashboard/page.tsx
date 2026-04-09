import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DeleteProjectButton from '@/components/DeleteProjectButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: repos } = await supabase
    .from('repos')
    .select()
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Client Repos</h1>
        <Button asChild>
          <Link href="/dashboard/repos/new">Add repo</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(repos ?? []).map(repo => (
          <Card key={repo.id}>
            <CardHeader>
              <CardTitle>{repo.display_name}</CardTitle>
              <CardDescription>{repo.github_repo}</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/${repo.id}`}>Open</Link>
              </Button>
              <DeleteProjectButton repoId={repo.id} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}