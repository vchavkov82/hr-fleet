import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default function HelpCenterRedirect() {
  redirect(`/${routing.defaultLocale}/help-center`)
}
