// Handle our foreground/data-only notifications before Firebase installs its click handler.
self.addEventListener('notificationclick', event => {
  const target = event.notification.data?.url;
  if (!target) return; // Notification payloads use Firebase's fcm_options.link handler.
  event.stopImmediatePropagation();
  event.notification.close();
  const url = new URL(target, self.location.origin);
  if (url.origin !== self.location.origin) return;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find(client => new URL(client.url).origin === url.origin);
    if (existing) { await existing.navigate(url.href); await existing.focus(); }
    else await self.clients.openWindow(url.href);
  })());
});
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// We are hardcoding the standard config here because env variables are not
// injected into service workers by Vite by default unless specifically configured.
const firebaseConfig = {
  apiKey: "AIzaSyCImLyyrOTXNGRAz0AtVs4QWkNGZYqm_BU",
  authDomain: "iota-seoul-cft.firebaseapp.com",
  projectId: "iota-seoul-cft",
  storageBucket: "iota-seoul-cft.firebasestorage.app",
  messagingSenderId: "530452135733",
  appId: "1:530452135733:web:a7516d1209f741dc04967c"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // FCM already displays notification payloads. Showing again produces duplicate alerts.
  if (payload.notification) return;
  const notificationTitle = payload.notification?.title || 'IOTA Seoul 알림';
  const notificationOptions = {
    body: payload.data?.body,
    icon: '/icons/iota-app-icon-v2-192.png',
    tag: payload.data?.notification_id || payload.messageId,
    data: { url: payload.data?.url || '/platform/iotaseoul/workflow' }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
