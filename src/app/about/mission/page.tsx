import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mission",
};

const FALLBACK_MISSION_HTML = `
<p>The Human Computation Institute (HCI) is a nonprofit innovation center dedicated to advancing the science and practice of human computation—systems that combine networked people and machines to address complex societal challenges.</p>
<p>We engineer sustainable participatory approaches that can improve health, humanitarian, and educational outcomes by leveraging the complementary strengths of collective human intelligence and computational infrastructure.</p>
`;

export default async function MissionPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "mission_html" },
  });

  const html = setting?.value?.trim() || FALLBACK_MISSION_HTML;

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Mission
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />
          <div
            className="text-gray-600 leading-relaxed space-y-4 [&_a]:text-[var(--color-accent)] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
      <section className="bg-[var(--color-bg-light)] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>
            Learn more about our team on the{" "}
            <a
              href="/about/people"
              className="font-semibold text-[var(--color-accent)] hover:underline"
            >
              People
            </a>{" "}
            page and our work on{" "}
            <a
              href="/projects"
              className="font-semibold text-[var(--color-accent)] hover:underline"
            >
              Projects
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
