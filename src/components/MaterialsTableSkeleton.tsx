'use client'

interface MaterialsTableSkeletonProps {
  rows?: number
}

export default function MaterialsTableSkeleton({ rows = 10 }: MaterialsTableSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" role="status" aria-label="Carregando materiais">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 bg-gray-50/60 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="hidden sm:flex items-center gap-8">
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="hidden md:block h-3 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0"
          style={{ opacity: 1 - i * 0.06 }}
        >
          {/* Icon placeholder */}
          <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />

          {/* Title + badge */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* Size */}
          <div className="hidden sm:block h-4 w-12 bg-gray-100 rounded animate-pulse flex-shrink-0" />

          {/* Downloads */}
          <div className="hidden md:block h-4 w-8 bg-gray-100 rounded animate-pulse flex-shrink-0" />

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}

      <span className="sr-only">Carregando materiais de estudo...</span>
    </div>
  )
}
