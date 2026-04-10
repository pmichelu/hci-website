"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineRectangleGroup,
  HiOutlineBuildingOffice2,
  HiOutlineBookOpen,
  HiOutlineVideoCamera,
  HiOutlinePhoto,
  HiOutlineCog6Tooth,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineEnvelope,
} from "react-icons/hi2"

interface AdminSidebarProps {
  userName: string
  userRole: string
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: HiOutlineHome },
  { href: "/admin/people", label: "People", icon: HiOutlineUserGroup },
  { href: "/admin/projects", label: "Projects", icon: HiOutlineRectangleGroup },
  { href: "/admin/partners", label: "Partners", icon: HiOutlineBuildingOffice2 },
  { href: "/admin/publications", label: "Publications", icon: HiOutlineBookOpen },
  { href: "/admin/videos", label: "Videos", icon: HiOutlineVideoCamera },
  { href: "/admin/newsletters", label: "Newsletters", icon: HiOutlineEnvelope },
  { href: "/admin/media", label: "Media", icon: HiOutlinePhoto },
  { href: "/admin/settings", label: "Settings", icon: HiOutlineCog6Tooth },
]

const adminOnlyItems = [
  { href: "/admin/users", label: "Users", icon: HiOutlineUsers },
]

export default function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const allItems = userRole === "ADMIN" ? [...navItems, ...adminOnlyItems] : navItems

  return (
    <aside className="w-64 bg-[#2d2346] text-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-wider uppercase">HCI Admin</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {allItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-4">
        <p className="text-sm text-white/70 truncate mb-1">{userName}</p>
        <div className="flex items-center gap-4 mt-2">
          <Link
            href="/admin/account"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <HiOutlineUserCircle className="w-4 h-4" />
            Account
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <HiOutlineArrowRightStartOnRectangle className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
