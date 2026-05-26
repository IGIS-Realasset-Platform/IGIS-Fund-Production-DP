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
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'IOTA Seoul 알림';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon_iota.png' // Make sure this icon exists in public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
