import React from 'react'
import Link from 'next/link'

interface ServiceBoxProps {
  title: string
  description: string
  href: string
}

export const ServiceBox: React.FC<ServiceBoxProps> = ({ title, description, href }) => {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-gray-200 p-4 hover:border-hr-primary hover:bg-hr-primary-soft transition-colors"
    >
      <div>
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-gray-500 text-sm leading-snug">{description}</p>
      </div>
    </Link>
  )
}
