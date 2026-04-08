import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publications",
};

const SECTIONS = [
  {
    id: "books",
    title: "Books",
    categories: ["book", "books"],
  },
  {
    id: "journal",
    title: "Journal",
    categories: ["journal"],
  },
  {
    id: "articles",
    title: "Articles",
    categories: ["article", "articles"],
  },
] as const;

export default async function PublicationsPage() {
  const publications = await prisma.publication.findMany({
    orderBy: { sortOrder: "asc" },
  });

  function inSection(
    category: string,
    categories: readonly string[]
  ): boolean {
    const c = category.toLowerCase().trim();
    return categories.some((k) => k === c);
  }

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Publications
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handbooks, journals, and articles related to human computation and our
            work.
          </p>
        </div>
      </section>

      {SECTIONS.map((section, index) => {
        const items = publications.filter((p) =>
          inSection(p.category, section.categories)
        );
        const stripe =
          index % 2 === 0 ? "bg-[var(--color-bg-light)]" : "bg-white";

        return (
          <section key={section.id} id={section.id} className={`${stripe} py-16 md:py-20`}>
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-gray-700 mb-8">
                {section.title}
              </h2>
              {items.length === 0 ? (
                <p className="text-gray-500 text-sm">No entries in this section yet.</p>
              ) : (
                <ul className="space-y-8">
                  {items.map((pub) => (
                    <li key={pub.id} className="border-b border-gray-200 pb-8 last:border-0">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {pub.link ? (
                          <a
                            href={pub.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--color-accent)]"
                          >
                            {pub.title}
                          </a>
                        ) : (
                          pub.title
                        )}
                      </h3>
                      {pub.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {pub.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
