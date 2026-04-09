import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          HCI Blog
        </span>
        <a
          href="https://blog.hcinst.org/tag/science/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          Open in new window →
        </a>
      </div>
      <iframe
        src="https://blog.hcinst.org/tag/science/"
        title="HCI Blog - Science"
        className="w-full border-0"
        style={{ height: "calc(100vh - 160px)" }}
      />
    </section>
  );
}
