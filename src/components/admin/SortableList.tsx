"use client"

import { useState, useRef, useCallback } from "react"

interface SortableItem {
  id: string
  [key: string]: any
}

interface SortableListProps<T extends SortableItem> {
  items: T[]
  entity: string
  renderRow: (item: T, index: number) => React.ReactNode
  header: React.ReactNode
  onReordered?: () => void
}

export default function SortableList<T extends SortableItem>({
  items: initialItems,
  entity,
  renderRow,
  header,
  onReordered,
}: SortableListProps<T>) {
  const [items, setItems] = useState(initialItems)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function persistOrder(newItems: SortableItem[]) {
    setSaveStatus("saving")
    try {
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, ids: newItems.map((i) => i.id) }),
      })
      if (res.ok) {
        setSaveStatus("saved")
        onReordered?.()
      } else {
        setSaveStatus("error")
      }
    } catch {
      setSaveStatus("error")
    }
    if (fadeTimer.current) clearTimeout(fadeTimer.current)
    fadeTimer.current = setTimeout(() => setSaveStatus("idle"), 2000)
  }

  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index
    setDragIndex(index)
  }, [])

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index
    setOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }

    const from = dragItem.current
    const to = dragOverItem.current

    if (from !== to) {
      setItems((prev) => {
        const updated = [...prev]
        const [moved] = updated.splice(from, 1)
        updated.splice(to, 0, moved)
        persistOrder(updated)
        return updated
      })
    }

    dragItem.current = null
    dragOverItem.current = null
    setDragIndex(null)
    setOverIndex(null)
  }, [entity])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 px-3 py-3" />
              {header}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => (
              <tr
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                className={`transition-colors select-none ${
                  dragIndex === index
                    ? "opacity-40 bg-gray-100"
                    : overIndex === index && dragIndex !== null
                    ? "border-t-2 border-t-[var(--color-accent)]"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-3 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
                  </svg>
                </td>
                {renderRow(item, index)}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={99} className="px-6 py-12 text-center text-gray-400">
                  No items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {saveStatus !== "idle" && (
        <div className={`mt-3 text-sm transition-opacity ${
          saveStatus === "saving" ? "text-gray-500" :
          saveStatus === "saved" ? "text-green-600" :
          "text-red-600"
        }`}>
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Order saved."}
          {saveStatus === "error" && "Failed to save order."}
        </div>
      )}
    </div>
  )
}
