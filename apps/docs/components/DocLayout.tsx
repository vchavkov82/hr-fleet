import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  toc?: ReactNode
}

export function DocLayout({ children, toc }: Props) {
  return (
    <div className="flex gap-8 px-8 py-10 max-w-screen-xl mx-auto">
      <article className="flex-1 min-w-0">{children}</article>
      {toc && (
        <aside className="hidden xl:block w-64 shrink-0">{toc}</aside>
      )}
    </div>
  )
}
