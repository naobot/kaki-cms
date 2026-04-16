'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { signOut } from '@/lib/actions/auth'
import { Button } from './ui/button'

type Collection = {
  name: string
  label: string
}

type Singleton = {
  name: string
  label: string
  fields: { name: string }[]
}

type Props = {
  repoId?: string
  projectName?: string
  collections?: Collection[]
  singletons?: Singleton[]
  hasSettings?: boolean
  userType?: 'developer' | 'editor'
}

export default function Sidebar({ repoId, projectName, collections, singletons, hasSettings, userType }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r min-h-screen max-h-screen p-4 flex flex-col gap-4">
      <Link href="/dashboard" className="font-semibold tracking-tight">
        Kaki CMS
      </Link>
      <Separator />
      {repoId && projectName && (
        <>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {projectName}
              </p>
              <nav className="flex flex-col gap-1">
                {(collections ?? []).map(collection => (
                  <Link
                    key={collection.name}
                    href={`/dashboard/${repoId}/${collection.name}`}
                    className={`text-sm px-2 py-1 rounded-md hover:bg-accent transition-colors ${
                      pathname.includes(`/${collection.name}`)
                        ? 'bg-accent font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {collection.label}
                  </Link>
                ))}
              </nav>
            </div>

            {singletons && singletons.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Pages
                </p>
                <nav className="flex flex-col gap-1">
                  {singletons.map(singleton => (
                    <Link
                      key={singleton.name}
                      href={`/dashboard/${repoId}/singleton/${singleton.name}`}
                      className={`text-sm px-2 py-1 rounded-md hover:bg-accent transition-colors ${
                        pathname.includes(`/singleton/${singleton.name}`)
                          ? 'bg-accent font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {singleton.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {hasSettings && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Settings
                </p>
                <nav className="flex flex-col gap-1">
                  <Link
                    href={`/dashboard/${repoId}/settings`}
                    className={`text-sm px-2 py-1 rounded-md hover:bg-accent transition-colors ${
                      pathname === `/dashboard/${repoId}/settings`
                        ? 'bg-accent font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Site data
                  </Link>
                </nav>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}
      <div className="flex flex-col gap-4 mt-auto">
        {userType === 'developer' && (
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← All repos
          </Link>
        )}
        <form action={signOut} className="mt-auto">
          <Button type="submit" className="text-sm w-full">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}