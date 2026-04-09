'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'

type Collection = {
  name: string
  label: string
}

type Props = {
  repoId?: string
  projectName?: string
  collections?: Collection[]
}

export default function Sidebar({ repoId, projectName, collections }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r min-h-screen p-4 flex flex-col gap-4">
      <Link href="/dashboard" className="font-semibold tracking-tight">
        Kaki CMS
      </Link>
      <Separator />
      {repoId && projectName && (
        <>
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
          <Separator />
        </>
      )}
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-auto"
      >
        ← All repos
      </Link>
    </aside>
  )
}
