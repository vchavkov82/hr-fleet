'use client'

import { createContext, useCallback, useContext, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useTranslations } from 'next-intl'
import LoginForm from '@/app/[locale]/auth/login/LoginForm'
import SignUpForm from '@/app/[locale]/auth/sign-up/SignUpForm'
import { ContactForm } from '@/app/[locale]/contact/contact-form'

type ModalType = 'login' | 'signup' | 'contact' | null

interface ModalContextValue {
  openLogin: () => void
  openSignUp: (plan?: string) => void
  openContact: () => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [signUpPlan, setSignUpPlan] = useState('starter')

  const openLogin = useCallback(() => setActiveModal('login'), [])
  const openSignUp = useCallback((plan = 'starter') => {
    setSignUpPlan(plan)
    setActiveModal('signup')
  }, [])
  const openContact = useCallback(() => setActiveModal('contact'), [])
  const closeModal = useCallback(() => setActiveModal(null), [])

  return (
    <ModalContext.Provider value={{ openLogin, openSignUp, openContact, closeModal }}>
      {children}
      <LoginModal isOpen={activeModal === 'login'} onClose={closeModal} onSwitchToSignUp={() => { closeModal(); setTimeout(() => openSignUp(), 150) }} />
      <SignUpModal isOpen={activeModal === 'signup'} onClose={closeModal} plan={signUpPlan} onSwitchToLogin={() => { closeModal(); setTimeout(() => openLogin(), 150) }} />
      <ContactModal isOpen={activeModal === 'contact'} onClose={closeModal} />
    </ModalContext.Provider>
  )
}

/* ─── Shared modal shell ─── */

function ModalShell({
  isOpen,
  onClose,
  maxWidth = 'max-w-md',
  children,
}: {
  isOpen: boolean
  onClose: () => void
  maxWidth?: string
  children: React.ReactNode
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-4 scale-95"
            >
              <Dialog.Panel className={`relative w-full ${maxWidth} rounded-2xl bg-white shadow-2xl`}>
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

/* ─── Login Modal ─── */

function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignUp,
}: {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignUp: () => void
}) {
  const t = useTranslations('pages.auth.login')

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="p-8 pt-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <Dialog.Title as="h2" className="text-2xl font-bold font-heading text-navy">
            {t('heading')}
          </Dialog.Title>
          <p className="mt-1 text-sm text-gray-500">{t('sslNote')}</p>
        </div>

        <LoginForm
          emailLabel={t('emailLabel')}
          passwordLabel={t('passwordLabel')}
          forgotPassword={t('forgotPassword')}
          rememberMe={t('rememberMe')}
          submit={t('submit')}
          noAccount={t('noAccount')}
          signUpLink={t('signUpLink')}
          onSwitchToSignUp={onSwitchToSignUp}
        />
      </div>
    </ModalShell>
  )
}

/* ─── Sign Up Modal ─── */

function SignUpModal({
  isOpen,
  onClose,
  plan,
  onSwitchToLogin,
}: {
  isOpen: boolean
  onClose: () => void
  plan: string
  onSwitchToLogin: () => void
}) {
  const t = useTranslations('pages.auth.signUp')

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-8 pt-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <Dialog.Title as="h2" className="text-2xl font-bold font-heading text-navy">
            {t('heading')}
          </Dialog.Title>
        </div>

        <SignUpForm
          plan={plan}
          selectedPlan={t('selectedPlan')}
          growthPlan={t('growthPlan')}
          trialNote={t('trialNote')}
          firstNameLabel={t('firstNameLabel')}
          lastNameLabel={t('lastNameLabel')}
          companyLabel={t('companyLabel')}
          emailLabel={t('emailLabel')}
          passwordLabel={t('passwordLabel')}
          termsText={t('termsText')}
          termsLink={t('termsLink')}
          and={t('and')}
          privacyLink={t('privacyLink')}
          submitFree={t('submitFree')}
          submitTrial={t('submitTrial')}
          noCardNote={t('noCardNote')}
          hasAccount={t('hasAccount')}
          loginLink={t('loginLink')}
          onSwitchToLogin={onSwitchToLogin}
        />
      </div>
    </ModalShell>
  )
}

/* ─── Contact Modal ─── */

function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const t = useTranslations('pages.contact')

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-8 pt-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <Dialog.Title as="h2" className="text-2xl font-bold font-heading text-navy">
            {t('form.title')}
          </Dialog.Title>
          <p className="mt-1 text-sm text-gray-500">{t('form.description')}</p>
        </div>

        <ContactForm
          labels={{
            firstName: t('form.firstName'),
            lastName: t('form.lastName'),
            email: t('form.email'),
            phone: t('form.phone'),
            company: t('form.company'),
            companySize: t('form.companySize'),
            selectCompanySize: t('form.selectCompanySize'),
            companySizes: {
              small: t('form.companySizes.small'),
              medium: t('form.companySizes.medium'),
              large: t('form.companySizes.large'),
              enterprise: t('form.companySizes.enterprise'),
            },
            subject: t('form.subject'),
            selectSubject: t('form.selectSubject'),
            subjects: {
              general: t('form.subjects.general'),
              sales: t('form.subjects.sales'),
              demo: t('form.subjects.demo'),
              support: t('form.subjects.support'),
              partnership: t('form.subjects.partnership'),
              feedback: t('form.subjects.feedback'),
              other: t('form.subjects.other'),
            },
            message: t('form.message'),
            privacy: t('form.privacy'),
            privacyLink: t('form.privacyLink'),
            submit: t('form.submit'),
            submitting: t('form.submitting'),
            successTitle: t('form.successTitle'),
            successMessage: t('form.successMessage'),
            successAction: t('form.successAction'),
          }}
        />
      </div>
    </ModalShell>
  )
}
