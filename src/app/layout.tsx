import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: {
    default: "Human Computation Institute",
    template: "%s | Human Computation Institute",
  },
  description:
    "The Human Computation Institute is a nonprofit innovation center dedicated to the betterment of society through novel methods leveraging the complementary strengths of networked humans and machines.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const projects = await prisma.project.findMany({
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  });

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:ital,wght@0,300;0,700;1,300&family=Ubuntu:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header projects={projects} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
