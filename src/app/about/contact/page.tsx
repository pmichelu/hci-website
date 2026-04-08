import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

const DEFAULT_ADDRESS = "Ithaca, NY";
const DEFAULT_PHONE = "+1(607)319-3119";
const DEFAULT_EMAIL = "info@humancomputation.org";

async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export default async function ContactPage() {
  const [address, phone, email, twitter, facebook, youtube] = await Promise.all(
    [
      getSetting("contact_address"),
      getSetting("contact_phone"),
      getSetting("contact_email"),
      getSetting("social_twitter"),
      getSetting("social_facebook"),
      getSetting("social_youtube"),
    ]
  );

  const displayAddress = address?.trim() || DEFAULT_ADDRESS;
  const displayPhone = phone?.trim() || DEFAULT_PHONE;
  const displayEmail = email?.trim() || DEFAULT_EMAIL;

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Contact
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mb-10" />
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                Mailing address
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {displayAddress}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                Phone &amp; email
              </h2>
              <p className="text-gray-600">
                <a
                  href={`tel:${displayPhone.replace(/\D/g, "")}`}
                  className="hover:text-[var(--color-accent)]"
                >
                  {displayPhone}
                </a>
              </p>
              <p className="mt-2">
                <a
                  href={`mailto:${displayEmail}`}
                  className="text-[var(--color-accent)] font-semibold hover:underline"
                >
                  {displayEmail}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg-light)] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-6">
            Social media
          </h2>
          <ul className="space-y-3 text-gray-600">
            {twitter && (
              <li>
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  Twitter / X
                </a>
              </li>
            )}
            {facebook && (
              <li>
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  Facebook
                </a>
              </li>
            )}
            {youtube && (
              <li>
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  YouTube
                </a>
              </li>
            )}
            {!twitter && !facebook && !youtube && (
              <li className="text-gray-500 text-sm">
                Social links will appear here when configured in site settings.
              </li>
            )}
          </ul>
        </div>
      </section>
    </>
  );
}
