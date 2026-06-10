import DynamicImage from "@/components/DynamicImage";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NewsletterSignup from "@/components/NewsletterSignup";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return { title: "Project Not Found" };
  return { title: project.name };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });

  if (!project) notFound();

  return (
    <>
      {project.hidden && (
        <style
          dangerouslySetInnerHTML={{
            __html: `header { display: none !important; } footer { display: none !important; }`,
          }}
        />
      )}

      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-14 items-center">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              {project.imageUrl ? (
                <DynamicImage
                  src={project.imageUrl}
                  alt={project.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-primary)]">
                  <span className="text-white text-xl font-bold uppercase tracking-wider px-4 text-center">
                    {project.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-gray-700 mb-4">
                {project.name}
              </h1>
              {project.description ? (
                <p className="text-gray-600 leading-relaxed mb-6">
                  {project.description}
                </p>
              ) : (
                <p className="text-gray-500 italic mb-6">
                  Description coming soon.
                </p>
              )}
              {project.link && (
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-bold uppercase tracking-wider text-[var(--color-accent)] hover:underline"
                >
                  Visit project website →
                </Link>
              )}
              {project.newsletterSlug && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Get updates
                  </p>
                  <NewsletterSignup
                    slugs={[project.newsletterSlug]}
                    compact
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {project.content && (
        <section className="bg-[var(--color-bg-light)] py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-700 prose-headings:uppercase prose-headings:tracking-wider prose-a:text-[var(--color-accent)] prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          </div>
        </section>
      )}

      {!project.hidden && (
        <section className="py-10 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <Link
              href="/projects"
              className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] hover:underline"
            >
              ← Back to all projects
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
