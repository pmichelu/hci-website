"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
    children: [
      { label: "Stall Catchers", href: "/projects#stall-catchers" },
      { label: "Dream Catchers", href: "/projects#dream-catchers" },
      { label: "Crowd2Map Tanzania", href: "/projects#crowd2map" },
      { label: "Civium", href: "/projects#civium" },
      { label: "CrowdMeter", href: "/projects#crowdmeter" },
    ],
  },
  {
    label: "Publications",
    href: "/publications",
    children: [
      { label: "Books", href: "/publications#books" },
      { label: "Human Computation Journal", href: "/publications#journal" },
      { label: "Articles", href: "/publications#articles" },
    ],
  },
  { label: "Videos", href: "/videos" },
  { label: "Blog", href: "/blog" },
  { label: "Donate", href: "/donate" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/images/logos/hci-logo.png"
              alt="Human Computation Institute"
              width={80}
              height={80}
              className="h-16 w-auto"
            />
            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-wider text-[var(--color-primary)] leading-tight">
                HUMAN<br />COMPUTATION<br />INSTITUTE
              </div>
            </div>
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
                  className="px-3 py-2 text-sm font-semibold tracking-wider uppercase text-gray-700 hover:text-[var(--color-primary)] transition-colors"
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
