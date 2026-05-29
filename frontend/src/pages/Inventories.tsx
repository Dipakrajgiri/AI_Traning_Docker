import { Link } from "react-router-dom"
import { Plus, Warehouse, Tags, Boxes, Calendar, ChevronRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getInventories, createInventory } from "../api"
import type { Inventory } from "../types"
import { Modal } from "../components/Modal"

export default function Inventories() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = () => {
    setLoading(true)
    getInventories()
      .then(setInventories)
      .catch((err) => setError(err.message || "Failed to load inventories"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!formData.name.trim()) {
      setFormError("Name is required")
      return
    }

    setIsSubmitting(true)
    try {
      await createInventory(formData.name.trim(), formData.description.trim() || undefined)
      setIsModalOpen(false)
      setFormData({ name: "", description: "" })
      loadData()
    } catch (err: any) {
      setFormError(err.message || "Failed to create inventory")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Inventories</h1>
          <p className="mt-1 text-sm text-slate-400">Manage stock across your storage locations.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500">
          <Plus className="h-4 w-4" />
          New Inventory
        </button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Inventory">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
              {formError}
            </div>
          )}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
              Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Main Warehouse"
            />
          </div>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-300">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              placeholder="e.g. Primary storage for electronics..."
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </Modal>

      {error && (
        <div className="mb-6 rounded-md bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {inventories.map((inv) => (
          <Link
            key={inv.id}
            to={`/inventories/${inv.id}`}
            className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-indigo-500/50"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Warehouse className="h-5 w-5" />
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">{inv.name}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-400">{inv.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-800 pt-4 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Tags className="h-4 w-4 text-slate-500" />
                {inv.category_count} categories
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Boxes className="h-4 w-4 text-slate-500" />
                {inv.item_count} items
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              Created {new Date(inv.created_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  )
}
