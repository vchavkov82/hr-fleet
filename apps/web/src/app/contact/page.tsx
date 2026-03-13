import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default function ContactRedirect() {
  redirect(`/${routing.defaultLocale}/contact`)
}
