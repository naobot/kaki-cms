import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="p-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-32 mb-8" />

      <Skeleton className="h-4 w-24 mb-4" />
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>

      <Skeleton className="h-4 w-24 mb-4" />
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>

      <Skeleton className="h-32 rounded-lg" />
    </div>
  )
}