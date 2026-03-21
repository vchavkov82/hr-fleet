import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '../lib/posts'
import TagList from './TagList'
import dayjs from 'dayjs'

type Props = {
  post: Post
}

export default function PostCard({ post }: Props) {
  return (
    <article className="flex flex-col gap-3">
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-lg">
          <Image
            src={post.featuredImage}
            alt={post.title}
            width={960}
            height={540}
            className="w-full object-cover aspect-video hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}
      <div className="flex flex-col gap-2">
        <TagList tags={post.tags} />
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-3">{post.description}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <time dateTime={post.pubDatetime}>
            {dayjs(post.pubDatetime).format('D MMMM YYYY')}
          </time>
          <span>&middot;</span>
          <span>{post.readingTime}</span>
        </div>
      </div>
    </article>
  )
}
