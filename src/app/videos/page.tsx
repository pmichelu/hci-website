import VideosGrid from "@/components/VideosGrid";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Videos",
};

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Videos
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Talks, seminars, and highlights from the human computation community.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg-light)] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <VideosGrid
            videos={videos.map((v) => ({
              id: v.id,
              title: v.title,
              youtubeUrl: v.youtubeUrl,
            }))}
          />
        </div>
      </section>
    </>
  );
}
