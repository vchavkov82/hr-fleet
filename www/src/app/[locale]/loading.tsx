// Suspense skeleton for app/hr — shown during async server component rendering.
// Covers all routes under [locale]: /, /features, /pricing, /hr-tools, /blog, /auth/*, etc.
// Uses the HR brand color (#215cff primary blue, #1E293B navy).
// No 'use client' needed — this is a pure server component rendered instantly by Next.js streaming.
export default function HrLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton — matches the navy gradient hero sections across HR site pages */}
      <div className="bg-[#1E293B] py-24 px-4">
        <div className="mx-auto max-w-5xl space-y-5 text-center">
          <div className="mx-auto h-4 w-24 animate-pulse rounded-full bg-white/20" />
          <div className="mx-auto h-12 w-3/4 animate-pulse rounded-xl bg-white/20" />
          <div className="mx-auto h-6 w-1/2 animate-pulse rounded-lg bg-white/15" />
          <div className="flex justify-center gap-3 pt-2">
            <div className="h-12 w-36 animate-pulse rounded-lg bg-[#215cff]/60" />
            <div className="h-12 w-36 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>
      </div>
      {/* Content section skeleton — matches feature/pricing card grids */}
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="mx-auto mb-10 h-8 w-1/3 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
              <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-1 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
