'use client'

import { useState, useEffect } from 'react'
import { EmailGateModal } from './email-gate-modal'

interface TemplateDownloadCardProps {
  slug: string
  templateName: string
  labels: {
    format: string
    pdf: string
    downloadFree: string
    downloadAgain: string
    unlocked: string
  }
  emailGateLabels: {
    heading: string
    subtext: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    submit: string
    successMessage: string
  }
}

export function TemplateDownloadCard({
  slug,
  templateName,
  labels,
  emailGateLabels,
}: TemplateDownloadCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const unlocked = localStorage.getItem(`template_unlocked_${slug}`)
    if (unlocked === 'true') {
      setIsUnlocked(true)
    }
  }, [slug])

  function handleDownloadClick() {
    if (isUnlocked) {
      // Already unlocked — show success message again
      return
    }
    setIsModalOpen(true)
  }

  function handleModalClose() {
    setIsModalOpen(false)
    // Check if the template was just unlocked
    const unlocked = localStorage.getItem(`template_unlocked_${slug}`)
    if (unlocked === 'true') {
      setIsUnlocked(true)
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sticky top-24">
        {/* Template thumbnail placeholder */}
        <div className="aspect-[3/4] w-full rounded-xl bg-gradient-to-br from-primary-50 via-surface-light to-primary-100 flex items-center justify-center mb-6">
          <svg className="h-16 w-16 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        {/* Format info */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-500">{labels.format}</span>
          <span className="font-medium text-navy">{labels.pdf}</span>
        </div>

        {/* Status badge */}
        {isUnlocked && (
          <div className="flex items-center gap-2 text-sm text-success mb-4">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {labels.unlocked}
          </div>
        )}

        {/* Download button */}
        <button
          onClick={handleDownloadClick}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all ${
            isUnlocked
              ? 'bg-primary-50 text-primary hover:bg-primary-100'
              : 'btn-primary'
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isUnlocked ? labels.downloadAgain : labels.downloadFree}
        </button>

        <p className="mt-3 text-xs text-gray-500 text-center">
          Free to download. No credit card required.
        </p>
      </div>

      <EmailGateModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        templateSlug={slug}
        templateName={templateName}
        labels={emailGateLabels}
      />
    </>
  )
}
