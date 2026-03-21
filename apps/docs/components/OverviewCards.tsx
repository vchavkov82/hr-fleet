import React from 'react'
import Image from 'next/image'

interface OverviewCardProps {
  title: string
  description: string | React.ReactNode
  href: string
  icon: string
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, description, href, icon }) => {
  return (
    <a
      href={href}
      className="flex flex-col items-start rounded-lg border border-gray-200 p-5 hover:border-hr-primary hover:bg-hr-primary-soft transition-colors"
    >
      <Image src={icon} alt={`${title} icon`} width={40} height={40} className="mb-3" />
      <div>
        <div className="font-semibold text-gray-900 text-sm mb-1">{title}</div>
        <div className="text-gray-500 text-sm leading-snug">{description}</div>
      </div>
    </a>
  )
}

interface OverviewCardsProps {
  cards: OverviewCardProps[]
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
      {cards.map((card, index) => (
        <OverviewCard key={index} {...card} />
      ))}
    </div>
  )
}
