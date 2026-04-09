import Link from "next/link";
import Image from "next/image";
import PersonCard from "@/components/PersonCard";
import { prisma } from "@/lib/prisma";
import { FaPaintBrush, FaAddressBook, FaUsers, FaQuoteLeft } from "react-icons/fa";

function parseSocialLinks(val: string | null | undefined): Record<string, string> | undefined {
  if (!val) return undefined;
  try { return typeof val === "string" ? JSON.parse(val) : val; } catch { return undefined; }
}

const mediaLogos = [
  { name: "Wired", image: "/images/media/wired.png", url: "https://www.wired.com/story/searching-for-lost-memories-under-thousands-of-microscopes/" },
  { name: "Discover", image: "/images/media/discover.png", url: "https://www.discovermagazine.com/mind/are-clogged-blood-vessels-the-key-to-treating-alzheimers-disease" },
  { name: "The Washington Post", image: "/images/media/washington-post.png", url: "https://www.washingtonpost.com/national/health-science/alzheimers-cure-is-being-pursued-with-the-help-of-an-online-game/2018/05/04/f6b93b28-4dff-11e8-af46-b1d6dc0d9bfe_story.html" },
  { name: "Financial Times", image: "/images/media/financial-times.png", url: "https://www.ft.com/content/b023732c-93d8-11e7-a9e6-11d2f0ebb7f0" },
  { name: "Women's Health", image: "/images/media/womens-health.png", url: "https://www.facebook.com/155097092254/posts/citizenscience-is-featured-in-the-may-2019-issue-of-womens-health-learn-more-abo/10155634319542255/" },
  { name: "Daily Mail", image: "/images/media/daily-mail.png", url: "https://www.dailymail.co.uk/sciencetech/article-3380709/Superintellingence-AI-humans-working-solve-climate-change-end-wars-researchers-claim.html" },
  { name: "PBS", image: "/images/media/pbs.png", url: "https://www.youtube.com/watch?v=k7lXJDNaQ5o" },
  { name: "BBC", image: "/images/media/bbc.png", url: "https://www.bbc.co.uk/programmes/w3csz1p2" },
  { name: "Science Friday", image: "/images/media/science-friday.png", url: "https://www.sciencefriday.com/segments/how-citizen-science-can-speed-up-alzheimers-research/" },
  { name: "The Science Show", image: "/images/media/the-science-show.png", url: "https://www.abc.net.au/radionational/programs/scienceshow/citizen-scientists-help-with-alzheimer%E2%80%99s-research/9262558" },
  { name: "Nature Biotechnology", image: "/images/media/nature-biotech.png", url: "https://stallcatchers.com/images/partners/dark/nature_biotech_citsci.pdf" },
  { name: "Science News", image: "/images/media/science-news.png", url: "https://www.sciencenews.org/article/website-turns-alzheimers-research-game" },
  { name: "El Español", image: "/images/media/el-espanol.png", url: "https://stallcatchers.com/images/partners/dark/elespanol-com.pdf" },
  { name: "La Stampa", image: "/images/media/la-stampa.png", url: "https://www.lastampa.it/salute/2019/02/14/news/alzheimer-il-videogioco-con-cui-anche-tu-puoi-aiutare-gli-scienziati-a-sconfiggere-la-malattia-1.34771635" },
  { name: "Gadgette", image: "/images/media/gadgette.png", url: "https://www.gadgette.com/2018/05/25/stall-catchers/" },
  { name: "Education Week", image: "/images/media/education-week.png", url: "https://www.edweek.org/ew/articles/2019/05/31/students-and-researchers-team-up-to-create.html" },
];

export default async function HomePage() {
  const [people, projects, partners] = await Promise.all([
    prisma.person.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.partner.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const coreTeam = people.filter((p) => p.category === "core");
  const board = people.filter((p) => p.category === "board");
  const alumni = people.filter((p) => p.category === "alumni");
  const faculty = people.filter((p) => p.category === "faculty");

  return (
    <>
      {/* Quote Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-3">
            <FaQuoteLeft
              className="text-[var(--color-accent)] shrink-0 mt-1"
              size={30}
            />
            <blockquote className="text-base text-gray-500 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              The Human Computation Institute is the first international center
              that brings together the vision and competencies needed to realize
              my father&apos;s dream of augmenting human collaboration for the
              benefit of humanity. I am pleased to advise on the center&apos;s
              ongoing activities on behalf of the Doug Engelbart institute.
            </blockquote>
          </div>
          <p className="mt-6 ml-10 text-sm text-[var(--color-accent)] italic">
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
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-70">
            {mediaLogos.map((logo) => (
              <a
                key={logo.name}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-100 transition-opacity"
              >
                <Image
                  src={logo.image}
                  alt={logo.name}
                  width={141}
                  height={40}
                  className="h-6 md:h-8 w-auto object-contain"
                />
              </a>
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
                <FaAddressBook size={36} />
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
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 uppercase tracking-wider mb-4">
              Our Partners
            </h3>
            <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-12" />
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
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 uppercase tracking-wider mb-4">
              Our Projects
            </h3>
            <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .filter((p) => p.imageUrl)
                .map((project) => (
                  <Link
                    key={project.id}
                    href={project.link || `/projects#${project.slug}`}
                    className="group relative overflow-hidden rounded-lg aspect-[4/3]"
                  >
                    <Image
                      src={project.imageUrl!}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                      <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h4 className="font-bold text-lg">{project.name}</h4>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
            <div className="text-center mt-10">
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
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 uppercase tracking-wider mb-4">
              Core Team
            </h3>
            <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {coreTeam.map((person) => (
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
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 uppercase tracking-wider mb-4">
              Board of Directors
            </h3>
            <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {board.map((person) => (
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
      )}

      {/* Alumni */}
      {alumni.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 uppercase tracking-wider mb-4">
              Alumni
            </h3>
            <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {alumni.map((person) => (
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
      )}

      {/* External Faculty */}
      {faculty.length > 0 && (
        <section className="bg-[var(--color-bg-light)] py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-700 uppercase tracking-wider mb-4">
              External Faculty
            </h3>
            <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {faculty.map((person) => (
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
