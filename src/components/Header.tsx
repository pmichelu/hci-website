"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface HeaderProps {
  projects?: { name: string; slug: string }[];
}

export default function Header({ projects = [] }: HeaderProps) {
  const navItems = [
    {
      label: "About",
      href: "/about",
      children: [
        { label: "Mission", href: "/about/mission" },
        { label: "People", href: "/about/people" },
        { label: "Partners", href: "/about/partners" },
        { label: "Diversity, Equity & Inclusion", href: "/about/dei" },
        { label: "Contact", href: "/about/contact" },
      ],
    },
    {
      label: "Projects",
      href: "/projects",
      children: projects.map((p) => ({
        label: p.name,
        href: `/projects#${p.slug}`,
      })),
    },
    {
      label: "Publications",
      href: "/publications",
      children: [
        { label: "Books", href: "/publications/books" },
        { label: "Human Computation Journal", href: "/publications/journal" },
        { label: "Articles", href: "/publications/articles" },
      ],
    },
    { label: "Videos", href: "/videos" },
    { label: "Blog", href: "/blog" },
    { label: "Newsletters", href: "/newsletters" },
    { label: "Donate", href: "/donate" },
  ];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="bg-[var(--color-bg-light)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-32">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logos/hci-logo.png"
              alt="Human Computation Institute"
              width={325}
              height={130}
              className="h-[110px] w-auto"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() =>
                  item.children && setOpenDropdown(item.label)
                }
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-2 font-light tracking-wider uppercase text-gray-600 hover:text-[var(--color-accent)] transition-colors"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "20px" }}
                  {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.label}
                </Link>
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-md py-2 min-w-[240px] z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              aria-label="Search"
              className="ml-2 p-2 text-gray-500 hover:text-[var(--color-accent)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>
          </nav>

          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block py-2 text-sm font-semibold uppercase tracking-wider text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block py-1 text-sm text-gray-500"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
