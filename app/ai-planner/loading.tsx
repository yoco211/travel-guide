export default function PlannerLoading() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-gradient-to-br from-primary-50 via-orange-50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-48 h-8 bg-surface-200 rounded-full animate-pulse mx-auto mb-6" />
            <div className="w-64 h-10 bg-surface-200 rounded animate-pulse mx-auto mb-4" />
            <div className="w-96 h-6 bg-surface-200 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="w-24 h-4 bg-surface-100 rounded animate-pulse" />
              <div className="w-full h-12 bg-surface-100 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
