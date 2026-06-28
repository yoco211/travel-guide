export default function DestinationLoading() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero skeleton */}
      <div className="relative h-[300px] md:h-[400px] bg-surface-200 animate-pulse" />
      {/* Tabs skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-2 mb-8 border-b border-surface-200 pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-20 h-10 bg-surface-100 rounded animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-surface-100 rounded animate-pulse"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
