import { useMemo, useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { getItems } from "../api"
import type { Item } from "../types"
import { StatusBadge } from "../components/StatusBadge"

const currency = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })

export default function AllItems() {
  const [query, setQuery] = useState("")
  const [itemsData, setItemsData] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getItems()
      .then(setItemsData)
      .catch((err) => setError(err.message || "Failed to load items"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return itemsData
    return itemsData.filter(
      (i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q),
    )
  }, [query, itemsData])

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
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">All Items</h1>
        <p className="mt-1 text-sm text-slate-400">Every item across all inventories and categories.</p>
      </header>

      <div className="mb-5 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or SKU..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Inventory</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40">
                <td className="px-4 py-3 font-medium text-slate-100">{item.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
                <td className="px-4 py-3 text-slate-300">-</td>
                <td className="px-4 py-3 text-slate-400">{item.category_id}</td>
                <td className="px-4 py-3 text-right text-slate-300">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-slate-300">{currency(item.price)}</td>
                <td className="px-4 py-3 text-slate-300">{item.supplier}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(item.last_updated).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                  No items match &quot;{query}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
