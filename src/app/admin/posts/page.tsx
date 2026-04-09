import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DeleteButton from "@/components/admin/DeleteButton"

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{post.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{post.author?.name || "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <DeleteButton entity="posts" id={post.id} />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
