"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export type VideoItem = {
  id: string;
  title: string;
  youtubeUrl: string;
};

const PAGE_SIZE = 15;

function extractVideoId(url: string): string {
  const embed = url.match(/\/embed\/([^?&]+)/);
  if (embed) return embed[1];
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return watch[1];
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return short[1];
  return url;
}

function toEmbedUrl(url: string): string {
  const id = extractVideoId(url);
  return `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=0`;
}

export default function VideosGrid({ videos }: { videos: VideoItem[] }) {
  const [page, setPage] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const pageCount = Math.max(1, Math.ceil(videos.length / PAGE_SIZE));

  const pageVideos = useMemo(() => {
    const start = page * PAGE_SIZE;
    return videos.slice(start, start + PAGE_SIZE);
  }, [videos, page]);

  const activeVideo = pageVideos[activeVideoIndex] ?? pageVideos[0];

  if (videos.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">No videos yet.</p>
    );
  }

  return (
    <div>
      {activeVideo && (
        <div className="mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-md">
            <iframe
              key={activeVideo.id}
              title={activeVideo.title}
              src={toEmbedUrl(activeVideo.youtubeUrl)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.max(0, p - 1));
              setActiveVideoIndex(0);
            }}
            disabled={page === 0}
            className="text-sm font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-[var(--color-accent)] transition-colors"
          >
            &laquo; Prev
          </button>
          <span className="text-sm text-gray-500">
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.min(pageCount - 1, p + 1));
              setActiveVideoIndex(0);
            }}
            disabled={page >= pageCount - 1}
            className="text-sm font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-[var(--color-accent)] transition-colors"
          >
            Next &raquo;
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {pageVideos.map((video, idx) => {
          const videoId = extractVideoId(video.youtubeUrl);
          const isActive = idx === activeVideoIndex;
          return (
            <button
              key={video.id}
              type="button"
              onClick={() => setActiveVideoIndex(idx)}
              className={`text-left group transition-all ${
                isActive ? "ring-2 ring-[var(--color-accent)] rounded-md" : ""
              }`}
            >
              <div className="relative aspect-video rounded-md overflow-hidden bg-gray-200">
                <Image
                  src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                  alt={video.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <svg className="w-10 h-10 text-white/80 group-hover:text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-gray-700 leading-snug line-clamp-2">
                {video.title}
              </p>
            </button>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.max(0, p - 1));
              setActiveVideoIndex(0);
            }}
            disabled={page === 0}
            className="text-sm font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-[var(--color-accent)] transition-colors"
          >
            &laquo; Prev
          </button>
          <span className="text-sm text-gray-500">
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.min(pageCount - 1, p + 1));
              setActiveVideoIndex(0);
            }}
            disabled={page >= pageCount - 1}
            className="text-sm font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-[var(--color-accent)] transition-colors"
          >
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
}
