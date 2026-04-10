"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ListmonkListInfo {
  id: number
  uuid: string
  name: string
  type: string
  status: string
  subscriber_count: number
}

export default function SyncFromListmonkButton() {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [remoteLists, setRemoteLists] = useState<ListmonkListInfo[]>([])
  const [existingIds, setExistingIds] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      const [remoteRes, localRes] = await Promise.all([
        fetch("/api/admin/newsletters/sync"),
        fetch("/api/admin/newsletters"),
      ])

      const remote: ListmonkListInfo[] = await remoteRes.json()
      const local = await localRes.json()

      const localIds = new Set<number>(
        (Array.isArray(local) ? local : []).map((l: { listmonkListId: number }) => l.listmonkListId),
      )

      setRemoteLists(remote)
      setExistingIds(localIds)
      setSelected(new Set())
      setShowModal(true)
    } catch (err) {
      alert("Failed to fetch lists from Listmonk. Check your API credentials.")
      console.error(err)
    } finally {
      setSyncing(false)
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleImport() {
    setImporting(true)
    try {
      for (const id of selected) {
        const list = remoteLists.find((l) => l.id === id)
        if (!list) continue

        const slug = list.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

        await fetch("/api/admin/newsletters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            listmonkListId: list.id,
            listmonkUuid: list.uuid,
            name: list.name,
            description: "",
            displayOrder: 0,
            active: true,
          }),
        })
      }
      setShowModal(false)
      router.refresh()
    } catch (err) {
      alert("Failed to import some lists.")
      console.error(err)
    } finally {
      setImporting(false)
    }
  }

  const newLists = remoteLists.filter((l) => !existingIds.has(l.id))

  return (
    <>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {syncing ? "Syncing..." : "Sync from Listmonk"}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Listmonk Lists</h2>
              <p className="text-sm text-gray-500 mt-1">
                {newLists.length > 0
                  ? "Select lists to import as newsletter options."
                  : "All Listmonk lists are already imported."}
              </p>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4">
              {remoteLists.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No lists found in Listmonk.</p>
              ) : (
                <div className="space-y-2">
                  {remoteLists.map((list) => {
                    const alreadyImported = existingIds.has(list.id)
                    return (
                      <label
                        key={list.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          alreadyImported
                            ? "border-gray-100 bg-gray-50 cursor-default"
                            : "border-gray-200 hover:border-[var(--color-primary)] cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(list.id)}
                          onChange={() => toggleSelect(list.id)}
                          disabled={alreadyImported}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] disabled:opacity-40"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${alreadyImported ? "text-gray-400" : "text-gray-900"}`}>
                              {list.name}
                            </span>
                            <span className="text-xs text-gray-400">#{list.id}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${list.type === "public" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                              {list.type}
                            </span>
                            {alreadyImported && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600">imported</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {list.subscriber_count} subscribers &middot; {list.status}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              {newLists.length > 0 && (
                <button
                  onClick={handleImport}
                  disabled={selected.size === 0 || importing}
                  className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {importing ? "Importing..." : `Import ${selected.size} List${selected.size !== 1 ? "s" : ""}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
