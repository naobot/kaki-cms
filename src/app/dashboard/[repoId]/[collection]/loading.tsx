import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="border rounded-md divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}