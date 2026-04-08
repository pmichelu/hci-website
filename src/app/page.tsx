import Link from "next/link";
import Image from "next/image";
import PersonCard from "@/components/PersonCard";
import { prisma } from "@/lib/prisma";
import { FaPaintBrush, FaAddressCard, FaUsers } from "react-icons/fa";

const mediaLogos = [
  "Wired",
  "Discover",
  "The Washington Post",
  "Financial Times",
  "Women's Health",
  "Daily Mail",
  "PBS",
  "BBC",
  "Science Friday",
  "The Science Show",
  "Nature Biotechnology",
  "Science News",
  "El Español",
  "La Stampa",
  "Gadgette",
  "Education Week",
];

export default async function HomePage() {
  const [people, projects, partners] = await Promise.all([
    prisma.person.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.partner.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const coreTeam = people.filter((p) => p.category === "core");
  const board = people.filter((p) => p.category === "board");
  const faculty = people.filter((p) => p.category === "faculty");

  return (
    <>
      {/* Quote Section */}
      <section className="bg-[var(--color-bg-light)] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative">
            <span className="text-6xl text-[var(--color-accent)] font-serif absolute -top-8 -left-4">
              &ldquo;
            </span>
            <blockquote className="text-lg md:text-xl text-gray-500 leading-relaxed italic pl-8">
              The Human Computation Institute is the first international center
              that brings together the vision and competencies needed to realize
              my father&apos;s dream of augmenting human collaboration for the
              benefit of humanity. I am pleased to advise on the center&apos;s
              ongoing activities on behalf of the Doug Engelbart institute.
            </blockquote>
          </div>
          <p className="mt-6 text-sm text-gray-400 italic">
            Christina Engelbart
          </p>
        </div>
      </section>

      {/* In the Media */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-8">
            In the Media
          </h3>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-10" />
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {mediaLogos.map((logo) => (
              <span
                key={logo}
                className="text-sm md:text-base font-bold text-gray-500 tracking-wider"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Collective Solutions */}
      <section className="bg-[var(--color-bg-light)] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-light text-gray-700 mb-16 normal-case tracking-normal">
            Collective Solutions to Societal Problems
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-24 mb-16">
            <Link
              href="/projects"
              className="flex flex-col items-center group"
            >
              <div className="w-24 h-24 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <FaPaintBrush size={36} />
              </div>
              <span className="text-[var(--color-accent)] font-bold tracking-wider uppercase">
                Projects
              </span>
            </Link>
            <Link
              href="/about/partners"
              className="flex flex-col items-center group"
            >
              <div className="w-24 h-24 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <FaAddressCard size={36} />
              </div>
              <span className="text-[var(--color-accent)] font-bold tracking-wider uppercase">
                Partners
              </span>
            </Link>
            <Link
              href="/about/people"
              className="flex flex-col items-center group"
            >
              <div className="w-24 h-24 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <FaUsers size={36} />
              </div>
              <span className="text-[var(--color-accent)] font-bold tracking-wider uppercase">
                People
              </span>
            </Link>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-600">
            <p className="font-semibold">
              The Human Computation Institute is a nonprofit innovation center
              dedicated to the betterment of society through novel methods
              leveraging the complementary strengths of networked humans and
              machines.
            </p>
            <p>
              We strive to engineer sustainable participatory systems that have a
              profound impact on health, humanitarian, and educational outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Our Partners */}
      {partners.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-12">
              Our Partners
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-12">
              {partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={160}
                      height={60}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">
                      {partner.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Projects */}
      {projects.length > 0 && (
        <section className="bg-[var(--color-bg-light)] py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-12">
              Our Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={project.link || `/projects#${project.slug}`}
                  className="group relative overflow-hidden rounded-lg aspect-[4/3]"
                >
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--color-primary)] flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {project.name}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                    <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h4 className="font-bold text-lg">{project.name}</h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/projects"
                className="inline-block border-2 border-gray-700 text-gray-700 px-8 py-3 font-semibold tracking-wider uppercase text-sm hover:bg-gray-700 hover:text-white transition-colors"
              >
                See all our projects
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Core Team */}
      {coreTeam.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-12">
              Core Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {coreTeam.map((person) => (
                <PersonCard
                  key={person.id}
                  name={person.name}
                  title={person.title || ""}
                  bio={person.bio || undefined}
                  photoUrl={person.photoUrl || undefined}
                  socialLinks={
                    person.socialLinks
                      ? (person.socialLinks as Record<string, string>)
                      : undefined
                  }
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/about/people"
                className="inline-block border-2 border-gray-700 text-gray-700 px-8 py-3 font-semibold tracking-wider uppercase text-sm hover:bg-gray-700 hover:text-white transition-colors"
              >
                See all core team &amp; past members
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Board of Directors */}
      {board.length > 0 && (
        <section className="bg-[var(--color-bg-light)] py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-12">
              Board of Directors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {board.map((person) => (
                <PersonCard
                  key={person.id}
                  name={person.name}
                  title={person.title || ""}
                  bio={person.bio || undefined}
                  photoUrl={person.photoUrl || undefined}
                  socialLinks={
                    person.socialLinks
                      ? (person.socialLinks as Record<string, string>)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* External Faculty */}
      {faculty.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-12">
              External Faculty
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {faculty.map((person) => (
                <PersonCard
                  key={person.id}
                  name={person.name}
                  title={person.title || ""}
                  bio={person.bio || undefined}
                  photoUrl={person.photoUrl || undefined}
                  socialLinks={
                    person.socialLinks
                      ? (person.socialLinks as Record<string, string>)
                      : undefined
                  }
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/about/people"
                className="inline-block border-2 border-gray-700 text-gray-700 px-8 py-3 font-semibold tracking-wider uppercase text-sm hover:bg-gray-700 hover:text-white transition-colors"
              >
                See all External Faculty
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
