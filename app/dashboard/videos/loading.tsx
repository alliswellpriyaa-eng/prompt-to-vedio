export default function VideosLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Thumbnail skeleton */}
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />

            {/* Text skeleton */}
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded animate-pulse w-1/3 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
