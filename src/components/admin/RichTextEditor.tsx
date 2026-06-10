"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import { useState, useCallback, useEffect } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  label?: string
}

export default function RichTextEditor({ value, onChange, label = "Content" }: RichTextEditorProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [initialLinkUrl, setInitialLinkUrl] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openLinkModal = useCallback(() => {
    if (!editor) return
    setInitialLinkUrl(editor.getAttributes("link").href || "")
    setLinkModalOpen(true)
  }, [editor])

  const applyLink = useCallback((url: string) => {
    if (!editor) return
    const trimmed = url.trim()
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      const { from, to } = editor.state.selection
      if (from === to) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: trimmed,
            marks: [{ type: "link", attrs: { href: trimmed } }],
          })
          .run()
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run()
      }
    }
    setLinkModalOpen(false)
  }, [editor])

  const removeLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setLinkModalOpen(false)
  }, [editor])

  const addImage = useCallback((url: string) => {
    if (!editor || !url) return
    editor.chain().focus().setImage({ src: url }).run()
    setMediaPickerOpen(false)
  }, [editor])

  if (!editor) return null

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent">
        <Toolbar editor={editor} onAddLink={openLinkModal} onAddImage={() => setMediaPickerOpen(true)} />
        <EditorContent editor={editor} />
      </div>

      {mediaPickerOpen && (
        <ImagePickerModal
          onSelect={addImage}
          onClose={() => setMediaPickerOpen(false)}
        />
      )}

      {linkModalOpen && (
        <LinkModal
          initialUrl={initialLinkUrl}
          onApply={applyLink}
          onRemove={removeLink}
          onClose={() => setLinkModalOpen(false)}
        />
      )}
    </div>
  )
}

function Toolbar({
  editor,
  onAddLink,
  onAddImage,
}: {
  editor: ReturnType<typeof useEditor> & {}
  onAddLink: () => void
  onAddImage: () => void
}) {
  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition ${active ? "bg-[var(--color-primary)] text-white" : "text-gray-600 hover:bg-gray-100"}`

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="Bold">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="Italic">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))} title="Underline">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))} title="Heading 2">
        <span className="text-xs font-bold px-0.5">H2</span>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))} title="Heading 3">
        <span className="text-xs font-bold px-0.5">H3</span>
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} title="Bullet List">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} title="Numbered List">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <button type="button" onClick={onAddLink} className={btnClass(editor.isActive("link"))} title="Add Link">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
      </button>
      <button type="button" onClick={onAddImage} className={btnClass(false)} title="Insert Image">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))} title="Blockquote">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition" title="Undo">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition" title="Redo">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
      </button>
    </div>
  )
}

interface MediaItem {
  id: string
  filename: string
  url: string
  mimeType?: string
}

function ImagePickerModal({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const item: MediaItem = await res.json()
        onSelect(item.url)
      }
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const filtered = search
    ? items.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()))
    : items

  const images = filtered.filter(
    (m) => m.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|svg|webp)$/i.test(m.url)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Insert Image</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
          <label className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer">
            {uploading ? "Uploading..." : "Upload New"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading media...</div>
          ) : images.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No images found.</div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {images.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[var(--color-accent)] transition"
                >
                  <img src={item.url} alt={item.filename} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white text-[10px] truncate">{item.filename}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function isImageFile(item: MediaItem) {
  return item.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|svg|webp)$/i.test(item.url)
}

function LinkModal({
  initialUrl,
  onApply,
  onRemove,
  onClose,
}: {
  initialUrl: string
  onApply: (url: string) => void
  onRemove: () => void
  onClose: () => void
}) {
  const [url, setUrl] = useState(initialUrl || "")
  const [browsing, setBrowsing] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")

  function startBrowsing() {
    setBrowsing(true)
    setLoading(true)
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false))
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const item: MediaItem = await res.json()
        setUrl(item.url)
        setBrowsing(false)
      }
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const filtered = search
    ? items.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{browsing ? "Select File" : "Add Link"}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {!browsing ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  autoFocus
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onApply(url)
                    }
                  }}
                  placeholder="https://example.com or /uploads/file.pdf"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={startBrowsing}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition whitespace-nowrap"
                >
                  Browse files
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Select text first, then add a link. Or leave text unselected to insert the URL.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {initialUrl ? (
                <button
                  type="button"
                  onClick={onRemove}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Remove link
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onApply(url)}
                  className="px-5 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setBrowsing(false)}
                className="text-sm text-[var(--color-primary)] hover:underline whitespace-nowrap"
              >
                ← Back
              </button>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
              <label className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer whitespace-nowrap">
                {uploading ? "Uploading..." : "Upload New"}
                <input type="file" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center text-gray-400 py-12">Loading files...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-gray-400 py-12">No files found.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setUrl(item.url)
                        setBrowsing(false)
                      }}
                      className="w-full flex items-center gap-3 px-2 py-2.5 hover:bg-gray-50 rounded-lg text-left transition"
                    >
                      {isImageFile(item) ? (
                        <img src={item.url} alt={item.filename} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      ) : (
                        <span className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">📄</span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">{item.filename}</span>
                        <span className="block text-xs text-gray-400 truncate">{item.url}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
