import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function ThreatFeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={`skeleton-${i}`} className="p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
