import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate",
};

export default function DonatePage() {
  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Donate
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              Your support helps the Human Computation Institute develop citizen
              science platforms, advance research, and broaden participation in
              discovery that benefits society.
            </p>
            <p>
              We are a nonprofit organization. Contributions help sustain projects
              like EyesOnALZ / Stall Catchers, Crowd2Map Tanzania, and new
              initiatives that combine human and machine intelligence for public
              good.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg-light)] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-6">
            PayPal
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-lg mx-auto">
            PayPal donation button placeholder. Replace this block with your live
            PayPal embed or hosted button when ready.
          </p>
          <div className="inline-flex items-center justify-center min-w-[200px] min-h-[56px] px-8 rounded-md bg-[var(--color-accent)] text-white font-bold uppercase tracking-wider text-sm opacity-90 cursor-not-allowed select-none">
            Donate with PayPal
          </div>
        </div>
      </section>
    </>
  );
}
