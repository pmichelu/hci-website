import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DeleteButton from "@/components/admin/DeleteButton"

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
        <Link
          href="/admin/videos/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Add Video
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">YouTube URL</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{video.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline truncate block max-w-64"
                  >
                    {video.youtubeUrl}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{video.sortOrder}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/admin/videos/${video.id}/edit`}
                    className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <DeleteButton entity="videos" id={video.id} />
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  No videos yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
