/* Simple push service worker to display notifications when push events arrive.
   This runs alongside Angular's ngsw-worker.js and only handles 'push' and
   'notificationclick' events so notifications are visible even when the app
   is not in the foreground. */

self.addEventListener('push', function (event) {
  let payload = {};
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {
    payload = { title: 'TuduNu', message: 'You have a new notification' };
  }

  const title = payload.title || 'TuduNu';
  const options = {
    body: payload.message || '',
    data: payload.data || {},
    icon: '/public/icons/icon-192x192.png',
    badge: '/public/icons/icon-96x96.png',
    timestamp: Date.now(),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const c of clientList) {
        if (c.url === url && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
