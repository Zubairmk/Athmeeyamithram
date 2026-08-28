export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  if (Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Notification.permission
}

// Prefers the service worker's showNotification (works even when the app's
// tab isn't focused, and supports click-to-focus); falls back to a plain
// page-level Notification when no service worker is available (e.g. dev
// mode without the PWA plugin active).
export async function showReminderNotification(title: string, body: string): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        body,
        icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
        badge: `${import.meta.env.BASE_URL}pwa-192x192.png`,
        tag: title,
      })
      return
    } catch {
      // fall through to page-level Notification
    }
  }
  new Notification(title, { body })
}
