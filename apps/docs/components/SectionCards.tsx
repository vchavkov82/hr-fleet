import React from 'react'
import { ServiceBox } from './ServiceBox'

interface Section {
  title: string
  description: string
  href: string
}

interface SectionCardsProps {
  sections: Section[]
  title?: string
}

export const SectionCards: React.FC<SectionCardsProps> = ({ sections, title }) => {
  return (
    <div className="my-6">
      {title && <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((section, index) => (
          <ServiceBox
            key={`${section.href}-${index}`}
            title={section.title}
            description={section.description}
            href={section.href}
          />
        ))}
      </div>
    </div>
  )
}
