'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DataFile } from '@/lib/cms/types'

type Collection = {
  name: string
  label: string
}

type Singleton = {
  name: string
  label: string
  fields: { name: string }[]
}

type Repo = {
  id: string
  name: string
}

type Props = {
  repoId?: string
  projectName?: string
  collections?: Collection[]
  singletons?: Singleton[]
  dataFiles?: DataFile[]
  userType?: 'developer' | 'editor'
  repos?: Repo[]
}

export default function Sidebar({ repoId, projectName, collections, singletons, dataFiles, userType, repos }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const showRepoSwitcher = userType === 'developer' && repoId && repos && repos.length > 1

  return (
    <aside className="w-56 shrink-0 border-r min-h-screen max-h-screen p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Link href="/dashboard" className="font-bold tracking-tight shrink-0">
          Kaki CMS
        </Link>
        {showRepoSwitcher && (
          <Select
            value={repoId}
            onValueChange={(value) => router.push(`/dashboard/${value}`)}
          >
            <SelectTrigger className="h-6 text-xs px-2 border-0 shadow-none bg-muted text-muted-foreground w-auto max-w-[90px] focus:ring-0">
              <SelectValue>{projectName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {repos.map((repo) => (
                <SelectItem key={repo.id} value={repo.id} className="text-xs">
                  {repo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <Separator />
      {repoId && projectName && (
        <>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Collections
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

            {(dataFiles ?? []).length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Data
                </p>
                <nav className="flex flex-col gap-1">
                  {(dataFiles ?? []).map(dataFile => (
                    <Link
                      key={dataFile.path}
                      href={`/dashboard/${repoId}/data/${dataFile.path}`}
                      className={`text-sm px-2 py-1 rounded-md hover:bg-accent transition-colors ${
                        pathname.includes(`/data/${dataFile.path}`)
                          ? 'bg-accent font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {dataFile.label}
                    </Link>
                  ))}
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