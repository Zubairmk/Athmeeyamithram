import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AdminLayout({
  title,
  backTo,
  children,
}: {
  title: string
  backTo?: { to: string; label: string }
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Admin
            </p>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          {backTo && (
            <Link
              to={backTo.to}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              ← {backTo.label}
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-6">{children}</main>
    </div>
  )
}
