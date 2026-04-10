import DynamicImage from "@/components/DynamicImage";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Human Computation Journal",
};

export default async function JournalPage() {
  const journals = await prisma.publication.findMany({
    where: { category: "journal" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
          Human Computation Journal
        </h1>
        <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />

        {journals.map((j) => (
          <div key={j.id}>
            {j.imageUrl && (
              <a
                href={j.link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="float-left mr-6 mb-4"
              >
                <DynamicImage
                  src={j.imageUrl}
                  alt={j.title}
                  width={232}
                  height={300}
                  className="rounded shadow-sm"
                />
              </a>
            )}
            {j.description && (
              <div className="text-gray-600 leading-relaxed">
                {j.description.split("\n\n").map((para, i) => (
                  <p key={i} className="mb-4">
                    {i === 0 && j.link ? (
                      <>
                        The transdisciplinary journal,{" "}
                        <a
                          href={j.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-accent)] hover:underline italic"
                        >
                          Human Computation
                        </a>
                        , is published by the Human Computation Institute. It is
                        an international forum for high-quality scholarly articles
                        in all areas of human computation, which concerns the{" "}
                        <em>
                          design or analysis of information processing systems in
                          which humans participate as computational elements
                        </em>
                        .
                      </>
                    ) : (
                      para
                    )}
                  </p>
                ))}
              </div>
            )}
            <div className="clear-both" />
          </div>
        ))}
      </div>
    </section>
  );
}
