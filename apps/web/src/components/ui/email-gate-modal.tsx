'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type FormData = z.infer<typeof schema>

interface EmailGateModalProps {
  isOpen: boolean
  onClose: () => void
  templateSlug: string
  templateName: string
  labels: {
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

export function EmailGateModal({
  isOpen,
  onClose,
  templateSlug,
  templateName,
  labels,
}: EmailGateModalProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function onSubmit(data: FormData) {
    // Store lead data in localStorage
    const existingLeads = JSON.parse(localStorage.getItem('template_leads') || '[]')
    existingLeads.push({
      email: data.email,
      name: data.name,
      templateSlug,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('template_leads', JSON.stringify(existingLeads))

    // Mark template as unlocked
    localStorage.setItem(`template_unlocked_${templateSlug}`, 'true')

    setSubmitted(true)
  }

  function handleClose() {
    setSubmitted(false)
    reset()
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {submitted ? (
                  <div className="text-center py-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mb-4">
                      <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <Dialog.Title as="h3" className="text-xl font-bold font-heading text-navy">
                      {labels.successMessage}
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-600">
                      The template will be sent to your email shortly.
                    </p>
                    <button
                      onClick={handleClose}
                      className="btn-primary mt-6 w-full"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Icon */}
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 mb-4">
                      <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <Dialog.Title as="h3" className="text-xl font-bold font-heading text-navy text-center">
                      {labels.heading.replace('{templateName}', templateName)}
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-gray-600 text-center">
                      {labels.subtext}
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="gate-name" className="block text-sm font-medium text-gray-700">
                          {labels.nameLabel}
                        </label>
                        <input
                          id="gate-name"
                          type="text"
                          {...register('name')}
                          placeholder={labels.namePlaceholder}
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="gate-email" className="block text-sm font-medium text-gray-700">
                          {labels.emailLabel}
                        </label>
                        <input
                          id="gate-email"
                          type="email"
                          {...register('email')}
                          placeholder={labels.emailPlaceholder}
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {labels.submit}
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        We respect your privacy. No spam, unsubscribe anytime.
                      </p>
                    </form>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
