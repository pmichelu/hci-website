import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diversity, Equity & Inclusion",
};

export default function DeiPage() {
  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Diversity, Equity &amp; Inclusion
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              The Human Computation Institute is committed to fostering an
              inclusive community across our research, partnerships, and citizen
              science programs. We believe diverse perspectives strengthen
              collective intelligence and improve outcomes for the communities
              we serve.
            </p>
            <p>
              This page will be expanded with HCI&apos;s DEI principles,
              practices, and resources. For questions or suggestions, please{" "}
              <a
                href="/about/contact"
                className="text-[var(--color-accent)] font-semibold hover:underline"
              >
                contact us
              </a>
              .
            </p>
          </div>
        </div>
      </section>
      <section className="bg-[var(--color-bg-light)] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 text-sm text-gray-500 text-center">
          Content forthcoming.
        </div>
      </section>
    </>
  );
}
