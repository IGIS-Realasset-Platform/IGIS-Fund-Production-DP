/* global self, clients */

self.addEventListener("message", (event) => {
  if (event.data?.type === "IOTA_FIREBASE_CONFIG") {
    self.iotaFirebaseConfig = event.data.config;
  }
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = {};
  }

  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || "IOTA 알림";
  const body = notification.body || data.body || "새 알림이 있습니다.";
  const targetUrl = data.url || data.link || "mobile-web-live.html";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: data.icon || undefined,
      badge: data.badge || undefined,
      data: {
        url: targetUrl,
        notification_id: data.notification_id || "",
        type: data.type || "",
        reference_id: data.reference_id || "",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "mobile-web-live.html";

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.includes("mobile-web-live.html") && "focus" in client) {
        await client.focus();
        return;
      }
    }
    if (clients.openWindow) {
      await clients.openWindow(targetUrl);
    }
  })());
});
