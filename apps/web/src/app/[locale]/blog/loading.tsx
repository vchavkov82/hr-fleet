export default function BlogLoading() {
  return (
    <div className="container-xl py-12 animate-pulse">
      <div className="mb-12">
        <div className="h-10 w-48 rounded-lg bg-gray-200 mb-4" />
        <div className="h-5 w-96 rounded bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="aspect-[16/9] bg-gray-100" />
            <div className="p-6 space-y-3">
              <div className="h-4 w-20 rounded-full bg-gray-100" />
              <div className="h-5 w-full rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-100" />
              <div className="h-4 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
