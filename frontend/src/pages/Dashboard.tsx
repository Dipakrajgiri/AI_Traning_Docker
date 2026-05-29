import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  DollarSign,
  Wallet,
  Warehouse,
  Tags,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getDashboardStats } from "../api"
import type { DashboardStats } from "../types"

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

export default function Dashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardStats()
      .then(setStatsData)
      .catch((err) => setError(err.message || "Failed to load dashboard stats"))
      .finally(() => setLoading(false))
  }, [])

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

  const {
    total_items,
    in_stock,
    low_stock,
    out_of_stock,
    total_value,
    total_cost,
    inventory_count,
    category_count,
  } = statsData || {
    total_items: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    total_value: 0,
    total_cost: 0,
    inventory_count: 0,
    category_count: 0,
  }

  const stats = [
    { label: "Total Items", value: total_items, icon: Boxes, accent: "text-indigo-400 bg-indigo-500/10" },
    { label: "In Stock", value: in_stock, icon: CheckCircle2, accent: "text-emerald-400 bg-emerald-500/10" },
    { label: "Low Stock", value: low_stock, icon: AlertTriangle, accent: "text-amber-400 bg-amber-500/10" },
    { label: "Out of Stock", value: out_of_stock, icon: XCircle, accent: "text-red-400 bg-red-500/10" },
    { label: "Total Value", value: currency(total_value), icon: DollarSign, accent: "text-indigo-400 bg-indigo-500/10" },
    { label: "Total Cost", value: currency(total_cost), icon: Wallet, accent: "text-blue-400 bg-blue-500/10" },
    { label: "Inventories", value: inventory_count, icon: Warehouse, accent: "text-indigo-400 bg-indigo-500/10" },
    { label: "Categories", value: category_count, icon: Tags, accent: "text-blue-400 bg-blue-500/10" },
  ]

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Overview of your inventory across all locations.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-100">{value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
