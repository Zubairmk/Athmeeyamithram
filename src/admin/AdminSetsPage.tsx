import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteSet, getAllSets, putSet, reorderSets } from '../db/sets'
import { getItemsForSet } from '../db/items'
import { seedDefaultSets } from '../db/seed'
import { slugify } from '../lib/slug'
import type { DhikrSet, SetCategory } from '../types/dhikr'
import { AdminLayout } from './AdminLayout'

const ICON_OPTIONS = [
  'sunrise',
  'sunset',
  'prayer-mat',
  'crescent',
  'shield',
  'compass',
  'star',
]

interface SetFormState {
  title_en: string
  title_ml: string
  slug: string
  category: SetCategory
  icon: string
}

const EMPTY_FORM: SetFormState = {
  title_en: '',
  title_ml: '',
  slug: '',
  category: 'occasion',
  icon: 'star',
}

export function AdminSetsPage() {
  const [sets, setSets] = useState<DhikrSet[]>([])
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SetFormState>(EMPTY_FORM)
  const [showNewForm, setShowNewForm] = useState(false)

  async function refresh() {
    setLoading(true)
    // Same first-launch race as Home.tsx: don't trust App.tsx's parallel
    // seed effect to have finished by the time this reads sets.
    await seedDefaultSets()
    const allSets = await getAllSets()
    setSets(allSets)
    const counts: Record<string, number> = {}
    await Promise.all(
      allSets.map(async (set) => {
        counts[set.id] = (await getItemsForSet(set.id)).length
      }),
    )
    setItemCounts(counts)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  function startEdit(set: DhikrSet) {
    setEditingId(set.id)
    setShowNewForm(false)
    setForm({
      title_en: set.title_en,
      title_ml: set.title_ml,
      slug: set.slug,
      category: set.category,
      icon: set.icon,
    })
  }

  function startNew() {
    setEditingId(null)
    setShowNewForm(true)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (!form.title_en.trim() || !form.slug.trim()) return
    const now = new Date().toISOString()
    if (editingId) {
      const existing = sets.find((s) => s.id === editingId)
      if (!existing) return
      await putSet({ ...existing, ...form, updated_at: now })
    } else {
      const id = form.slug
      await putSet({
        id,
        ...form,
        order: sets.length + 1,
        created_at: now,
        updated_at: now,
      })
    }
    setEditingId(null)
    setShowNewForm(false)
    setForm(EMPTY_FORM)
    await refresh()
  }

  async function handleDelete(set: DhikrSet) {
    const count = itemCounts[set.id] ?? 0
    const message =
      count > 0
        ? `Delete "${set.title_en}" and its ${count} item(s), including audio? This cannot be undone.`
        : `Delete "${set.title_en}"?`
    if (!window.confirm(message)) return
    await deleteSet(set.id)
    await refresh()
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= sets.length) return
    const reordered = [...sets]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setSets(reordered)
    await reorderSets(reordered.map((s) => s.id))
    await refresh()
  }

  const formVisible = showNewForm || editingId !== null

  return (
    <AdminLayout title="Dhikr Sets">
      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <ul className="space-y-2">
          {sets.map((set, index) => (
            <li
              key={set.id}
              className="flex items-center justify-between rounded border border-neutral-200 bg-white p-3"
            >
              <div>
                <div className="font-medium">
                  {set.title_en} <span className="text-neutral-400">·</span>{' '}
                  {set.title_ml}
                </div>
                <div className="text-xs text-neutral-500">
                  {set.category} · {itemCounts[set.id] ?? 0} item(s) · /{set.slug}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
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
                  disabled={index === sets.length - 1}
                  className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <Link
                  to={`/admin/sets/${set.id}`}
                  className="rounded px-2 py-1 text-neutral-700 hover:bg-neutral-100"
                >
                  Items
                </Link>
                <button
                  type="button"
                  onClick={() => startEdit(set)}
                  className="rounded px-2 py-1 text-neutral-700 hover:bg-neutral-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(set)}
                  className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!formVisible && (
        <button
          type="button"
          onClick={startNew}
          className="mt-4 rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          + Add set
        </button>
      )}

      {formVisible && (
        <div className="mt-4 space-y-3 rounded border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold">
            {editingId ? 'Edit set' : 'New set'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Title (English)
              <input
                className="mt-1 w-full rounded border border-neutral-300 p-2 text-sm"
                value={form.title_en}
                onChange={(e) => {
                  const title_en = e.target.value
                  setForm((f) => ({
                    ...f,
                    title_en,
                    slug: editingId ? f.slug : slugify(title_en),
                  }))
                }}
              />
            </label>
            <label className="text-sm">
              Title (Malayalam)
              <input
                dir="auto"
                className="mt-1 w-full rounded border border-neutral-300 p-2 text-sm"
                value={form.title_ml}
                onChange={(e) => setForm((f) => ({ ...f, title_ml: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              Slug
              <input
                className="mt-1 w-full rounded border border-neutral-300 p-2 text-sm disabled:bg-neutral-100"
                value={form.slug}
                disabled={!!editingId}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              />
            </label>
            <label className="text-sm">
              Category
              <select
                className="mt-1 w-full rounded border border-neutral-300 p-2 text-sm"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value as SetCategory }))
                }
              >
                <option value="time">time (Morning/Evening)</option>
                <option value="occasion">occasion</option>
              </select>
            </label>
            <label className="text-sm">
              Icon
              <select
                className="mt-1 w-full rounded border border-neutral-300 p-2 text-sm"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.title_en.trim() || !form.slug.trim()}
              className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewForm(false)
                setEditingId(null)
              }}
              className="rounded px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
