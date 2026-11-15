import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogCard } from "@/components/home/sections";
import { Prose } from "@/components/ui/content";
import { PageHero } from "@/components/ui/page-hero";
import { btn, container } from "@/components/ui/styles";
import { blogPosts, getPost } from "@/data/blog";
import { formatDate } from "@/lib/format";
import { siteImage } from "@/lib/images";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return { title: "Article not found" };
  const photo = siteImage("blog", post.slug);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: routes.post(post.slug) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: routes.post(post.slug),
      publishedTime: post.date,
      ...(photo ? { images: [{ url: photo.src, alt: photo.alt }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const more = blogPosts.filter((p) => p.slug !== post.slug);
  const photo = siteImage("blog", post.slug);
  return (
    <>
      <PageHero title={post.title} crumbs={[{ label: "Blog", href: routes.blog }, { label: post.title }]} description={`${formatDate(post.date)} · ${post.readMinutes} min read`} />
      <article className={`${container} py-14`}>
        {photo ? (
          <div className="relative mb-10 aspect-[16/9] max-w-3xl overflow-hidden bg-[#f4f4f3]">
            <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 800px) 768px, 100vw" className="object-cover" />
          </div>
        ) : null}
        <Prose>
          <p className="!text-lg !text-bx-ink">{post.excerpt}</p>
          {post.body.map((block, i) => (
            <section key={i}>
              {block.heading ? <h2>{block.heading}</h2> : null}
              {block.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </section>
          ))}
        </Prose>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={routes.estimate} className={btn.primary}>Get a Free Estimate</Link>
          <Link href={routes.blog} className={btn.outline}>All Articles</Link>
        </div>
      </article>
      <section className="border-t border-bx-line">
        <div className={`${container} py-14`}>
          <h2 className="mb-6 font-bx-serif text-3xl text-bx-ink">Keep reading</h2>
          <div className="grid gap-6 md:grid-cols-2">{more.map((p) => <BlogCard key={p.slug} post={p} />)}</div>
        </div>
      </section>
    </>
  );
}
