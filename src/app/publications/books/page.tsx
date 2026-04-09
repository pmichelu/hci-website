import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Books",
};

export default async function BooksPage() {
  const books = await prisma.publication.findMany({
    where: { category: "book" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
          Books
        </h1>
        <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />

        <div className="space-y-12">
          {books.map((book) => (
            <div key={book.id}>
              {book.imageUrl && (
                <a
                  href={book.link ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="float-left mr-6 mb-4"
                >
                  <Image
                    src={book.imageUrl}
                    alt={book.title}
                    width={200}
                    height={300}
                    className="rounded shadow-sm"
                  />
                </a>
              )}
              {book.description && (
                <div className="text-gray-600 leading-relaxed">
                  {book.description.split("\n\n").map((para, i) => (
                    <p key={i} className="mb-4">
                      {i === 0 && book.link ? (
                        <>
                          <a
                            href={book.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-accent)] hover:underline"
                          >
                            {para.split(",")[0]}
                          </a>
                          {para.includes(",") ? "," + para.split(",").slice(1).join(",") : ""}
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
      </div>
    </section>
  );
}
