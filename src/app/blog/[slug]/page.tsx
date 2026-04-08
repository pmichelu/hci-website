import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

function formatDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: "published" },
  });
  if (!post) return { title: "Post" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: "published" },
  });

  if (!post) notFound();

  return (
    <>
      <article className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            {formatDate(post.publishedAt)}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-6">
            {post.title}
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />
          <div
            className="post-body text-gray-600 leading-relaxed space-y-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-[var(--color-accent)] [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-700 [&_h2]:mt-8 [&_h3]:font-bold [&_h3]:text-gray-700"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="text-sm font-bold uppercase tracking-wider text-[var(--color-accent)] hover:underline"
            >
              ← Back to blog
            </Link>
          </div>
        </div>
      </article>
      <section className="bg-[var(--color-bg-light)] py-10">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-500">
          Human Computation Institute
        </div>
      </section>
    </>
  );
}
