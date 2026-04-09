import { auth } from "@/lib/auth"
import { SessionProvider } from "next-auth/react"
import AdminSidebar from "@/components/admin/AdminSidebar"

export const metadata = {
  title: "Admin | Human Computation Institute",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      {session ? (
        <div className="fixed inset-0 z-50 flex bg-gray-50">
          <AdminSidebar
            userName={session.user?.name || session.user?.email || "Admin"}
            userRole={session.user?.role || "EDITOR"}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-auto p-8">{children}</div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 bg-gray-100 flex items-center justify-center">
          {children}
        </div>
      )}
    </SessionProvider>
  )
}
