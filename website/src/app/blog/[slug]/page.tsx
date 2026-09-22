import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogCategories, getBlogPostBySlug, getBlogPosts } from '@/lib/data';
import { getStorageUrl } from '@/lib/media';
import { plainText, SITE_DESCRIPTION } from '@/lib/site';
import { blogPostJsonLd, breadcrumbJsonLd } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import BlogPostClient from './BlogPostClient';

export const dynamic = 'force-dynamic';

const loadPost = cache((slug: string) => getBlogPostBySlug(slug));

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await loadPost(params.slug);
  if (!post) return { title: 'Article not found', robots: { index: false } };

  const title = post.meta_title || post.title;
  const description = post.meta_description || plainText(post.excerpt || post.content, 160) || SITE_DESCRIPTION;
  const image = post.featured_image_path ? getStorageUrl('blog-images', post.featured_image_path) : undefined;
  const path = `/blog/${post.slug}`;

  return {
    title,
    description,
    ...(post.focus_keyword ? { keywords: post.focus_keyword } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      title,
      description,
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      ...(post.author_name ? { authors: [post.author_name] } : {}),
      ...(image ? { images: [{ url: image, alt: post.title }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await loadPost(params.slug);
  if (!post) notFound();

  const [categories, sameCategory] = await Promise.all([
    getBlogCategories(),
    getBlogPosts({ category: post.category_id }),
  ]);
  const relatedPosts = sameCategory.filter(related => related.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          blogPostJsonLd(post),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <BlogPostClient
        params={params}
        initialPost={post}
        initialRelatedPosts={relatedPosts}
        initialCategories={categories}
      />
    </>
  );
}
