import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default async function BlogSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/${routing.defaultLocale}/blog/${slug}`)
}
