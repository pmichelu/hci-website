import Link from "next/link";
import { FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-dark)] text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-center md:text-left">
            <p>
              &copy; 2018-{new Date().getFullYear()} Human Computation Institute
              {" | "}
              Except where otherwise noted, this website is licensed under a{" "}
              <Link
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-100 hover:text-white underline"
              >
                CC BY-SA 4.0
              </Link>{" "}
              International Licence.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com/hcinst"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter size={20} />
            </Link>
            <Link
              href="https://www.facebook.com/humancomputationinstitute"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <FaFacebookF size={20} />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UCoc_fLZ6NRqyJGeAVkev8Jg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <FaYoutube size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
