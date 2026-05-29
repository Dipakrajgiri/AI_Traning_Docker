import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Loader2, Plus } from "lucide-react"
import { getInventory, getCategories, getItems, createItem } from "../api"
import type { Inventory, Category, Item, ItemCreate } from "../types"
import { Breadcrumb } from "../components/Breadcrumb"
import { StatusBadge } from "../components/StatusBadge"
import { Modal } from "../components/Modal"

const currency = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })

export default function CategoryDetail() {
  const { invId, catId } = useParams<{ invId: string; catId: string }>()
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [rows, setRows] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: 0,
    min_stock: 0,
    price: 0,
    cost: 0,
    supplier: "",
    unit: "pcs"
  })

  const loadData = async () => {
    if (!invId || !catId) return
    setLoading(true)
    setError(null)
    try {
      const [invData, catsData, itemsData] = await Promise.all([
        getInventory(invId),
        getCategories(invId),
        getItems({ cat_id: catId })
      ])
      setInventory(invData)
      setCategory(catsData.find(c => c.id === catId) || null)
      setRows(itemsData)
    } catch (err: any) {
      setError(err.message || "Failed to load category details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [invId, catId])

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catId) return
    setFormError(null)
    if (!formData.name.trim() || !formData.sku.trim()) {
      setFormError("Name and SKU are required")
      return
    }

    setIsSubmitting(true)
    try {
      const newItem: ItemCreate = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category_id: catId,
        quantity: Number(formData.quantity),
        min_stock: Number(formData.min_stock),
        price: Number(formData.price),
        cost: Number(formData.cost),
        supplier: formData.supplier.trim() || undefined,
        unit: formData.unit.trim() || "pcs"
      }
      await createItem(newItem)
      setIsModalOpen(false)
      setFormData({ name: "", sku: "", quantity: 0, min_stock: 0, price: 0, cost: 0, supplier: "", unit: "pcs" })
      loadData()
    } catch (err: any) {
      setFormError(err.message || "Failed to create item")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Inventories", to: "/inventories" },
          { label: inventory?.name ?? "Inventory", to: `/inventories/${invId}` },
          { label: category?.name ?? "Category" },
        ]}
      />

      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{category?.name ?? "Category"}</h1>
          <p className="mt-1 text-sm text-slate-400">{category?.description ?? "Items in this category."}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500">
          <Plus className="h-4 w-4" />
          New Item
        </button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Item">
        <form onSubmit={handleCreateItem} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {formError && (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">Name *</label>
              <input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-100 outline-none focus:border-indigo-500" placeholder="e.g. Dell XPS 15" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="sku" className="mb-1.5 block text-sm font-medium text-slate-300">SKU *</label>
              <input id="sku" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-100 outline-none focus:border-indigo-500" placeholder="e.g. DELL-XPS-15" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="unit" className="mb-1.5 block text-sm font-medium text-slate-300">Unit</label>
              <input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-100 outline-none focus:border-indigo-500" placeholder="e.g. pcs" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-slate-300">Price</label>
              <input id="price" type="number" min="0" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-100 outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="cost" className="mb-1.5 block text-sm font-medium text-slate-300">Cost</label>
              <input id="cost" type="number" min="0" step="0.01" required value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-100 outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-slate-300">Quantity</label>
              <input id="quantity" type="number" min="0" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-100 outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="min_stock" className="mb-1.5 block text-sm font-medium text-slate-300">Min Stock</label>
              <input id="min_stock" type="number" min="0" required value={formData.min_stock} onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-100 outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2">
              <label htmlFor="supplier" className="mb-1.5 block text-sm font-medium text-slate-300">Supplier</label>
              <input id="supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-100 outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </Modal>

      <ItemsTable rows={rows} />
    </div>
  )
}

function ItemsTable({ rows }: { rows: Item[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium text-right">Qty</th>
            <th className="px-4 py-3 font-medium text-right">Min</th>
            <th className="px-4 py-3 font-medium text-right">Price</th>
            <th className="px-4 py-3 font-medium text-right">Cost</th>
            <th className="px-4 py-3 font-medium">Supplier</th>
            <th className="px-4 py-3 font-medium">Unit</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40">
              <td className="px-4 py-3 font-medium text-slate-100">{item.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
              <td className="px-4 py-3 text-right text-slate-300">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-slate-400">{item.min_stock}</td>
              <td className="px-4 py-3 text-right text-slate-300">{currency(item.price)}</td>
              <td className="px-4 py-3 text-right text-slate-400">{currency(item.cost)}</td>
              <td className="px-4 py-3 text-slate-300">{item.supplier}</td>
              <td className="px-4 py-3 text-slate-400">{item.unit}</td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-slate-400">{new Date(item.last_updated).toLocaleDateString()}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
                No items in this category.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
