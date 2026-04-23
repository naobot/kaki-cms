import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex flex-col gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}