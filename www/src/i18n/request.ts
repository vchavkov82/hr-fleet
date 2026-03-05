import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import en from '../../messages/en.json'
import bg from '../../messages/bg.json'

const messages: Record<string, typeof en> = { en, bg }

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: messages[locale],
  }
})
