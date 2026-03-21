import Link from 'next/link'
import { clsx } from 'clsx'

type Props = {
  tags: string[]
  className?: string
}

export default function TagList({ tags, className }: Props) {
  if (!tags.length) return null

  return (
    <div className={clsx('flex flex-wrap gap-2', className)}>
      {tags.map(tag => (
        <Link
          key={tag}
          href={`/tags/${tag}`}
          className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors"
        >
          #{tag}
        </Link>
      ))}
    </div>
  )
}
