import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles",
};

export default async function ArticlesPage() {
  const articles = await prisma.publication.findMany({
    where: { category: "article" },
    orderBy: { sortOrder: "asc" },
  });

  const byYear: Record<string, typeof articles> = {};
  for (const a of articles) {
    const year = a.description ?? "Other";
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(a);
  }
  const yearOrder = Object.keys(byYear).sort((a, b) => {
    if (a === "Early") return 1;
    if (b === "Early") return -1;
    return parseInt(b) - parseInt(a);
  });

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
          Articles
        </h1>
        <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />

        {yearOrder.map((year) => (
          <div key={year} className="mb-8">
            <h2 className="text-base font-bold text-gray-800 mb-3">
              {year === "Early" ? "Early Publications" : year}
            </h2>
            <ul className="list-disc pl-6 space-y-3">
              {byYear[year].map((a) => (
                <li
                  key={a.id}
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  {a.link ? (
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--color-accent)]"
                    >
                      {a.title}
                    </a>
                  ) : (
                    a.title
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
