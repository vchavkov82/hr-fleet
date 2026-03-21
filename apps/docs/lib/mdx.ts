import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'

export async function serializeMdx(content: string) {
  return serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [rehypePrettyCode as any, { theme: { dark: 'one-dark-pro', light: 'github-light' } }],
      ],
    },
  })
}
