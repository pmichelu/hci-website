"use client"

import { useRouter } from "next/navigation"

interface DeleteButtonProps {
  entity: string
  id: string
  label?: string
  onDeleted?: () => void
}

export default function DeleteButton({ entity, id, label = "Delete", onDeleted }: DeleteButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this item?")) return

    const res = await fetch(`/api/admin/${entity}/${id}`, { method: "DELETE" })
    if (res.ok) {
      onDeleted?.()
      router.refresh()
    } else {
      alert("Failed to delete item")
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 text-sm font-medium"
    >
      {label}
    </button>
  )
}
