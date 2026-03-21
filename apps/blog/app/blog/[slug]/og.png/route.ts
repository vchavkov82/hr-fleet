import { NextResponse } from 'next/server'
import { getPostBySlug } from '../../../../lib/posts'
import { generateOgImageForPost } from '../../../../lib/og'

export const runtime = 'nodejs'

type Params = {
  params: Promise<{ slug: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const png = await generateOgImageForPost({
      title: post.title,
      author: post.author,
    })

    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Failed to generate OG image', { status: 500 })
  }
}
