import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import type { SerializeOptions } from 'next-mdx-remote/dist/types'

export async function serializeMdx(content: string) {
  const options: SerializeOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode as Parameters<typeof serialize>[1]['mdxOptions']['rehypePlugins'][number],
          { theme: { dark: 'one-dark-pro', light: 'github-light' } },
        ],
      ],
    },
  }
  return serialize(content, options)
}
