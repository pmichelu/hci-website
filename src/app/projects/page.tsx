import DynamicImage from "@/components/DynamicImage";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import NewsletterSignup from "@/components/NewsletterSignup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Projects
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Citizen science platforms and research initiatives led by or in
            collaboration with HCI.
          </p>
        </div>
      </section>

      {projects.length === 0 ? (
        <section className="bg-[var(--color-bg-light)] py-16">
          <div className="max-w-6xl mx-auto px-6 text-center text-gray-500">
            No projects yet.
          </div>
        </section>
      ) : (
        projects.map((project, index) => {
          const stripe =
            index % 2 === 0 ? "bg-[var(--color-bg-light)]" : "bg-white";
          return (
            <section
              key={project.id}
              id={project.slug}
              className={`${stripe} py-16 md:py-20`}
            >
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
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-gray-700 mb-4">
                      {project.name}
                    </h2>
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
                        Visit project →
                      </Link>
                    )}
                    {project.newsletterSlug && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Get updates</p>
                        <NewsletterSignup slugs={[project.newsletterSlug]} compact />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })
      )}
    </>
  );
}
