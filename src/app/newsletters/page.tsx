import type { Metadata } from "next"
import NewsletterSignup from "@/components/NewsletterSignup"
import ManageSubscriptionsForm from "./ManageSubscriptionsForm"

export const metadata: Metadata = {
  title: "Newsletters",
}

export default function NewslettersPage() {
  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Newsletters
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay up to date with the latest news, research, and events from the
            Human Computation Institute. Select the newsletters you&apos;d like
            to receive.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg-light)] py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Subscribe to Our Newsletters
          </h2>
          <NewsletterSignup />
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Manage Your Subscriptions
          </h2>
          <p className="text-gray-600 mb-6">
            Already subscribed? Enter your email to receive a link to manage
            your newsletter preferences.
          </p>
          <ManageSubscriptionsForm />
        </div>
      </section>
    </>
  )
}
