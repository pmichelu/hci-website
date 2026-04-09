import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publications",
};

export default async function PublicationsPage() {
  const books = await prisma.publication.findMany({
    where: { category: "book" },
    orderBy: { sortOrder: "asc" },
  });
  const journals = await prisma.publication.findMany({
    where: { category: "journal" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
          Publications
        </h1>
        <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />

        <p className="text-gray-800 font-semibold mb-4">Books</p>
        <div className="flex flex-wrap gap-8 mb-10">
          {books.map((book) => (
            <figure key={book.id} className="max-w-[120px]">
              {book.imageUrl && (
                <Link href="/publications/books">
                  <Image
                    src={book.imageUrl}
                    alt={book.title}
                    width={120}
                    height={180}
                    className="rounded shadow-sm"
                  />
                </Link>
              )}
              <figcaption className="text-xs text-gray-600 mt-2 leading-snug">
                <Link
                  href="/publications/books"
                  className="hover:text-[var(--color-accent)]"
                >
                  {book.title}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="text-gray-800 font-semibold mb-4">Periodicals</p>
        <div className="flex flex-wrap gap-8 mb-10">
          {journals.map((j) => (
            <figure key={j.id} className="max-w-[120px]">
              {j.imageUrl && (
                <Link href="/publications/journal">
                  <Image
                    src={j.imageUrl}
                    alt={j.title}
                    width={120}
                    height={155}
                    className="rounded shadow-sm"
                  />
                </Link>
              )}
              <figcaption className="text-xs text-gray-600 mt-2 leading-snug">
                <Link
                  href="/publications/journal"
                  className="hover:text-[var(--color-accent)]"
                >
                  {j.title}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="text-gray-800 font-semibold mb-2">Articles</p>
        <Link
          href="/publications/articles"
          className="text-[var(--color-accent)] hover:underline text-sm"
        >
          List of articles →
        </Link>
      </div>
    </section>
  );
}
