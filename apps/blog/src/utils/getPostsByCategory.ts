import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "product-updates",
    name: "Product Updates",
    description: "Latest features and improvements to the HR platform.",
  },
  {
    slug: "compliance",
    name: "Compliance",
    description: "Stay up to date with HR regulations and legal requirements.",
  },
  {
    slug: "payroll",
    name: "Payroll",
    description: "Payroll processing tips, guides, and best practices.",
  },
  {
    slug: "customer-stories",
    name: "Customer Stories",
    description: "Real stories from businesses using our HR platform.",
  },
  {
    slug: "engineering",
    name: "Engineering",
    description: "Technical deep dives and engineering insights.",
  },
  {
    slug: "hr-news",
    name: "HR News",
    description: "Industry news and trends in human resources.",
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined =>
  CATEGORIES.find(c => c.slug === slug);

const getPostsByCategory = (
  posts: CollectionEntry<"blog">[],
  categorySlug: string
) =>
  getSortedPosts(
    posts.filter(post =>
      slugifyAll(post.data.tags).includes(categorySlug)
    )
  );

export default getPostsByCategory;
