import { Fragment } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1
          return (
            <Fragment key={i}>
              <li>
                {crumb.to && !isLast ? (
                  <Link to={crumb.to} className="text-slate-400 transition-colors hover:text-indigo-400">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-200">{crumb.label}</span>
                )}
              </li>
              {!isLast && <ChevronRight className="h-4 w-4 text-slate-600" aria-hidden="true" />}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
