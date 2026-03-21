import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'

export async function serializeMdx(content: string) {
  return serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
    parseFrontmatter: false,
  })
}
