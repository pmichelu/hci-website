import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support the Human Computation Institute",
};

export default function DonatePage() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
          Support the Human Computation Institute
        </h1>
        <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />
        <form
          action="https://www.paypal.com/donate"
          method="post"
          target="_top"
        >
          <input
            type="hidden"
            name="hosted_button_id"
            value="7VPM2ZQPYMY8E"
          />
          <input
            type="image"
            src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
            name="submit"
            title="PayPal - The safer, easier way to pay online!"
            alt="Donate with PayPal button"
            className="cursor-pointer"
          />
        </form>
      </div>
    </section>
  );
}
