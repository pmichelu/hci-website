import PersonCard from "@/components/PersonCard";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function parseSocialLinks(val: string | null | undefined): Record<string, string> | undefined {
  if (!val) return undefined;
  try { return typeof val === "string" ? JSON.parse(val) : val; } catch { return undefined; }
}

export const metadata: Metadata = {
  title: "People",
};

const CATEGORIES = [
  { key: "core", label: "Core Team" },
  { key: "board", label: "Board of Directors" },
  { key: "alumni", label: "Alumni" },
  { key: "faculty", label: "External Faculty" },
] as const;

export default async function PeoplePage() {
  const people = await prisma.person.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  const sections = CATEGORIES.map((cat) => ({
    ...cat,
    group: people.filter((p) => p.category === cat.key),
  })).filter((s) => s.group.length > 0);

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            People
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Researchers, advisors, and collaborators advancing human computation
            for societal benefit.
          </p>
        </div>
      </section>

      {sections.map(({ key, label, group }, index) => {
        const bg =
          index % 2 === 0 ? "bg-[var(--color-bg-light)]" : "bg-white";

        return (
          <section key={key} id={key} className={`${bg} py-16 md:py-20`}>
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-gray-700 mb-10 text-center">
                {label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {group.map((person) => (
                  <PersonCard
                    key={person.id}
                    name={person.name}
                    title={person.title || ""}
                    bio={person.bio || undefined}
                    photoUrl={person.photoUrl || undefined}
                    socialLinks={parseSocialLinks(person.socialLinks)}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
