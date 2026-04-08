"use client";

import { useMemo, useState } from "react";

export type VideoItem = {
  id: string;
  title: string;
  youtubeUrl: string;
};

const PAGE_SIZE = 6;

function toEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.includes("/embed/")) return trimmed;
  const watch = trimmed.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = trimmed.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  return trimmed;
}

export default function VideosGrid({ videos }: { videos: VideoItem[] }) {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(videos.length / PAGE_SIZE));

  const pageVideos = useMemo(() => {
    const start = page * PAGE_SIZE;
    return videos.slice(start, start + PAGE_SIZE);
  }, [videos, page]);

  if (videos.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">No videos yet.</p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
        {pageVideos.map((video) => (
          <div key={video.id} className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 leading-snug">
              {video.title}
            </h2>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-md">
              <iframe
                title={video.title}
                src={toEmbedUrl(video.youtubeUrl)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 border-gray-700 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 hover:text-white transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 border-gray-700 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 hover:text-white transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
