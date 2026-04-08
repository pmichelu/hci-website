import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

function formatDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Blog
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-6" />
          <p className="text-gray-600">
            News and updates from the Human Computation Institute.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg-light)] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500">No published posts yet.</p>
          ) : (
            <ul className="space-y-12">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="bg-white rounded-lg p-8 shadow-sm border border-gray-100"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    {formatDate(post.publishedAt)}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-gray-700 hover:text-[var(--color-accent)] transition-colors mb-3">
                      {post.title}
                    </h2>
                  </Link>
                  {post.excerpt && (
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-bold uppercase tracking-wider text-[var(--color-accent)] hover:underline"
                  >
                    Read more →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
