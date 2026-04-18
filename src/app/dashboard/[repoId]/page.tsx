'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import InviteForm from '@/components/InviteForm'
import { useRepo } from '@/lib/cms/context'

export default function RepoPage() {
  const { repo, config, userType } = useRepo()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">{repo.display_name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{repo.github_repo}</p>
      </div>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Collections
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.collections.map(collection => (
              <Link key={collection.name} href={`/dashboard/${repo.id}/${collection.name}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{collection.label}</CardTitle>
                    <CardDescription>{collection.path}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {config.singletons && config.singletons.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Pages
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {config.singletons.map(singleton => (
                <Link key={singleton.name} href={`/dashboard/${repo.id}/singleton/${singleton.name}`}>
                  <Card className="hover:bg-accent transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-base">{singleton.label}</CardTitle>
                      <CardDescription>{singleton.path}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {userType === 'developer' && <InviteForm repoId={repo.id} />}
    </div>
  )
}