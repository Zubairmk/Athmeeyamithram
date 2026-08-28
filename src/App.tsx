import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { DhikrPlayer } from './pages/DhikrPlayer'
import { Settings } from './pages/Settings'
import { useReminderScheduler } from './hooks/useReminderScheduler'

// Code-split: regular users never load the admin bundle over the network —
// it's only fetched when someone actually visits /admin.
const AdminSetsPage = lazy(() =>
  import('./admin/AdminSetsPage').then((m) => ({ default: m.AdminSetsPage })),
)
const AdminItemsPage = lazy(() =>
  import('./admin/AdminItemsPage').then((m) => ({ default: m.AdminItemsPage })),
)

function App() {
  useReminderScheduler()

  return (
    <Suspense fallback={<div className="p-8 text-sm text-neutral-500">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sets/:setId" element={<DhikrPlayer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminSetsPage />} />
        <Route path="/admin/sets/:setId" element={<AdminItemsPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
