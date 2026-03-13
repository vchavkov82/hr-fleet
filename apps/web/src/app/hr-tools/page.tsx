import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default function HrToolsRedirect() {
  redirect(`/${routing.defaultLocale}/hr-tools`)
}
