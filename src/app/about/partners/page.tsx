import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners",
};

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Partners
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Organizations collaborating with HCI on research, platforms, and
            outreach.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg-light)] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          {partners.length === 0 ? (
            <p className="text-center text-gray-500">No partners listed yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-14 items-center justify-items-center">
              {partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full max-w-[200px] min-h-[80px] p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={180}
                      height={72}
                      className="h-14 w-auto max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-center text-sm font-bold uppercase tracking-wider text-gray-700">
                      {partner.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
