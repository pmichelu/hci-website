import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return { title: "Page Not Found" };
  return { title: page.title };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });

  if (!page) notFound();

  return (
    <section className="bg-[var(--color-bg-light)] py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-gray-700 mb-8">
          {page.title}
        </h1>
        {page.content && (
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-700 prose-headings:uppercase prose-headings:tracking-wider prose-a:text-[var(--color-accent)] prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
      </div>
    </section>
  );
}
