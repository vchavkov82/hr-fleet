'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SidebarSection } from '@/lib/docs'

type Props = {
  items: SidebarSection[]
}

export function Sidebar({ items }: Props) {
  return (
    <nav
      aria-label="Documentation navigation"
      className="hidden md:block w-64 shrink-0 border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto py-6 px-4"
    >
      {items.map(section => (
        <SidebarGroup key={section.href} section={section} />
      ))}
    </nav>
  )
}

function SidebarGroup({ section }: { section: SidebarSection }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(section.href)
  const [open, setOpen] = useState(isActive)

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors"
        aria-expanded={open}
      >
        {section.title}
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5">
          {section.children.map(item => (
            <SidebarLink key={item.href} href={item.href} title={item.title} />
          ))}
        </ul>
      )}
    </div>
  )
}

function SidebarLink({ href, title }: { href: string; title: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'block rounded-md px-3 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-hr-primary-soft text-hr-primary font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {title}
      </Link>
    </li>
  )
}
