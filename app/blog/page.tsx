import type { Metadata } from "next";

import { BlogCard } from "@/components/home/sections";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" }, title: "The Journal", description: "Guides to pawn loans, gold values, authentication and smart buying from BHS Premier Pawn and Jewelry." };

export default function BlogIndex() {
  return (
    <>
      <PageHero title="Latest from the Blog" crumbs={[{ label: "Blog" }]} description="Plain-English guides from our appraisers and specialists." />
      <div className={`${container} grid gap-6 py-14 md:grid-cols-3`}>
        {blogPosts.map((post) => <BlogCard key={post.slug} post={post} />)}
      </div>
    </>
  );
}
