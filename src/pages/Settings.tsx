import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSettings, putSettings } from '../db/settings'
import { requestNotificationPermission, notificationsSupported } from '../lib/notifications'
import type { AppSettings, ReminderConfig } from '../types/dhikr'
import { IlluminatedCard } from '../components/IlluminatedCard'

type ReminderKey = 'morning' | 'evening'

function ReminderRow({
  label,
  config,
  onChange,
}: {
  label: string
  config: ReminderConfig
  onChange: (next: ReminderConfig) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-medium text-ink">{label}</p>
        <input
          type="time"
          value={config.time}
          disabled={!config.enabled}
          onChange={(e) => onChange({ ...config, time: e.target.value })}
          className="mt-1 rounded border border-gold-500/40 bg-white/70 px-2 py-1 text-sm text-ink disabled:opacity-40"
        />
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={config.enabled}
        onClick={() => onChange({ ...config, enabled: !config.enabled })}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          config.enabled ? 'bg-teal-700' : 'bg-ink/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            config.enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    getSettings().then(setSettings)
    setPermission(notificationsSupported() ? Notification.permission : 'unsupported')
  }, [])

  async function updateReminder(key: ReminderKey, next: ReminderConfig) {
    if (!settings) return
    // Toggling is the user's clear intent and must not be gated on the
    // permission prompt settling (it can hang or be dismissed without a
    // choice in some browsers) — persist the setting immediately, and
    // request permission as a separate, non-blocking follow-up. If it ends
    // up denied, showReminderNotification() checks at fire-time and simply
    // no-ops; the "denied" note below explains why nothing shows.
    const updated: AppSettings = { ...settings, reminders: { ...settings.reminders, [key]: next } }
    setSettings(updated)
    await putSettings(updated)

    if (next.enabled && permission !== 'granted' && notificationsSupported()) {
      requestNotificationPermission().then(setPermission)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-gold-500/30 bg-teal-800 px-5 py-4 text-paper">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <Link to="/" className="text-sm text-paper/80 hover:text-paper" aria-label="Back home">
            ← Back
          </Link>
          <h1 className="text-base font-medium">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-6">
        <p className="mb-3 text-xs font-medium tracking-wide text-ink-soft uppercase">
          Reminders
        </p>

        {!settings ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <IlluminatedCard className="divide-y divide-gold-500/20 px-4">
            <ReminderRow
              label="Morning reminder"
              config={settings.reminders.morning}
              onChange={(next) => updateReminder('morning', next)}
            />
            <ReminderRow
              label="Evening reminder"
              config={settings.reminders.evening}
              onChange={(next) => updateReminder('evening', next)}
            />
          </IlluminatedCard>
        )}

        {permission === 'denied' && (
          <p className="mt-3 text-xs text-ink-soft">
            Notifications are blocked for this app in your browser settings — reminders won't show
            until you allow them there.
          </p>
        )}
        {permission === 'unsupported' && (
          <p className="mt-3 text-xs text-ink-soft">
            This browser doesn't support notifications.
          </p>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          Reminders check while the app is open (including in a background tab) — like any local
          app with no server, they can't wake your device if it's fully closed.
        </p>
      </main>
    </div>
  )
}
