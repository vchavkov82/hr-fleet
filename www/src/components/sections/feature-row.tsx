interface FeatureRowProps {
  title: string
  description: string
  features: string[]
  imagePlaceholder: string
  reversed?: boolean
  id?: string
}

export function FeatureRow({
  title,
  description,
  features,
  imagePlaceholder,
  reversed = false,
  id,
}: FeatureRowProps) {
  return (
    <div id={id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Image side */}
      <div className={reversed ? 'lg:order-2' : undefined}>
        <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-gray-50">
          <div className="aspect-[16/10] bg-gradient-to-br from-primary-50 to-primary-100 relative p-4 sm:p-6">
            {/* Mock dashboard UI */}
            <div className="bg-white rounded-xl shadow-sm h-full flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-14 sm:w-16 bg-navy-dark flex-shrink-0 flex flex-col items-center py-4 gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/40" />
                <div className="w-7 h-7 rounded-lg bg-white/10" />
                <div className="w-7 h-7 rounded-lg bg-white/10" />
                <div className="w-7 h-7 rounded-lg bg-white/10" />
                <div className="w-7 h-7 rounded-lg bg-white/10" />
              </div>
              {/* Main content */}
              <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <div className="h-10 sm:h-12 border-b border-gray-100 flex items-center px-4 gap-3">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="ml-auto h-3 w-16 rounded bg-gray-100" />
                </div>
                {/* Content area */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3">
                  {/* Stat cards row */}
                  <div className="flex gap-2 sm:gap-3">
                    <div className="flex-1 h-12 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                      <div className="h-2 w-10 rounded bg-primary/20" />
                    </div>
                    <div className="flex-1 h-12 sm:h-14 rounded-lg bg-accent/10 flex items-center justify-center">
                      <div className="h-2 w-10 rounded bg-accent/20" />
                    </div>
                    <div className="flex-1 h-12 sm:h-14 rounded-lg bg-success/10 flex items-center justify-center hidden sm:flex">
                      <div className="h-2 w-10 rounded bg-success/20" />
                    </div>
                  </div>
                  {/* Chart area placeholder */}
                  <div className="flex-1 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <span className="text-sm sm:text-base font-medium text-primary/30">
                      {imagePlaceholder}
                    </span>
                  </div>
                  {/* Table rows placeholder */}
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-100" />
                    <div className="h-3 w-4/5 rounded bg-gray-100" />
                    <div className="h-3 w-3/5 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text side */}
      <div className={reversed ? 'lg:order-1' : undefined}>
        <h3 className="text-3xl font-bold font-heading text-navy">{title}</h3>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">{description}</p>
        <ul className="mt-6 space-y-3">
          {features.map((item) => (
            <li key={item} className="flex items-start gap-3 text-gray-700">
              <svg
                className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
