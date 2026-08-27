export const SkeletonCard = () => (
  <div className="bg-card-bg rounded-2xl shadow-sm p-4 animate-pulse">
    <div className="flex justify-between mb-2">
      <div className="h-4 bg-warm-gray/50 rounded w-24"></div>
      <div className="h-4 bg-warm-gray/50 rounded w-12"></div>
    </div>
    <div className="h-3 bg-warm-gray/40 rounded w-full mb-2"></div>
    <div className="h-3 bg-warm-gray/40 rounded w-3/4"></div>
  </div>
)

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
)
