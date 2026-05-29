import type { Item } from "../types"
type ItemStatus = Item['status'];

const styles: Record<ItemStatus, string> = {
  "in-stock": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  "low-stock": "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  "out-of-stock": "bg-red-500/10 text-red-400 ring-red-500/30",
}

const labels: Record<ItemStatus, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {labels[status]}
    </span>
  )
}
