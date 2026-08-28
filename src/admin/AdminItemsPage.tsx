import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSet } from '../db/sets'
import { deleteItem, getItemsForSet, reorderItems } from '../db/items'
import { getAudioBlob } from '../db/audio'
import type { DhikrItem, DhikrSet } from '../types/dhikr'
import { AdminLayout } from './AdminLayout'
import { AddItemForm } from './AddItemForm'

function ItemAudioPreview({ file }: { file: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    getAudioBlob(file).then((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      }
    })
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  if (!url) return <span className="text-xs text-neutral-400">audio missing</span>
  return <audio controls src={url} className="h-8 w-56" />
}

export function AdminItemsPage() {
  const { setId } = useParams<{ setId: string }>()
  const [set, setSet] = useState<DhikrSet | null>(null)
  const [items, setItems] = useState<DhikrItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<DhikrItem | null>(null)

  async function refresh() {
    if (!setId) return
    setLoading(true)
    const [s, itemList] = await Promise.all([getSet(setId), getItemsForSet(setId)])
    setSet(s ?? null)
    setItems(itemList)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId])

  async function handleDelete(item: DhikrItem) {
    if (!window.confirm('Delete this dhikr item and its audio?')) return
    await deleteItem(item.id)
    await refresh()
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const reordered = [...items]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setItems(reordered)
    await reorderItems(reordered.map((i) => i.id))
    await refresh()
  }

  if (!setId) return null

  return (
    <AdminLayout
      title={set ? `${set.title_en} · ${set.title_ml}` : 'Items'}
      backTo={{ to: '/admin', label: 'All sets' }}
    >
      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.id} className="rounded border border-neutral-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p dir="rtl" lang="ar" className="text-lg leading-relaxed">
                    {item.arabic_text}
                  </p>
                  {item.malayalam_text && (
                    <p dir="auto" lang="ml" className="mt-1 text-sm text-neutral-600">
                      {item.malayalam_text}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span>#{item.order}</span>
                    <span>{item.source.extraction_method}</span>
                    <span>confidence: {item.source.confidence}</span>
                    {item.source.needs_review && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">
                        ⚠ needs review
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <ItemAudioPreview file={item.audio.file} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item)
                      setShowAddForm(false)
                    }}
                    className="rounded px-2 py-1 text-neutral-700 hover:bg-neutral-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-neutral-500">No dhikr items yet.</p>
          )}
        </ul>
      )}

      <div className="mt-4">
        {showAddForm ? (
          <AddItemForm
            setId={setId}
            nextOrder={items.length + 1}
            onSaved={() => {
              setShowAddForm(false)
              refresh()
            }}
            onCancel={() => setShowAddForm(false)}
          />
        ) : editingItem ? (
          <AddItemForm
            setId={setId}
            nextOrder={items.length + 1}
            existing={editingItem}
            onSaved={() => {
              setEditingItem(null)
              refresh()
            }}
            onCancel={() => setEditingItem(null)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            + Add dhikr
          </button>
        )}
      </div>
    </AdminLayout>
  )
}
