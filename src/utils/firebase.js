import { Capacitor } from "@capacitor/core";
import { supabase } from "./supabaseClient";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let webMessagingClientPromise;

const getWebMessagingClient = async () => {
  if (Capacitor.isNativePlatform() || !window.isSecureContext) return null;

  if (!webMessagingClientPromise) {
    webMessagingClientPromise = Promise.all([
      import("firebase/app"),
      import("firebase/messaging")
    ]).then(async ([firebaseApp, firebaseMessaging]) => {
      if (!await firebaseMessaging.isSupported()) return null;

      const app = firebaseApp.getApps().length > 0
        ? firebaseApp.getApp()
        : firebaseApp.initializeApp(firebaseConfig);

      return {
        messaging: firebaseMessaging.getMessaging(app),
        getToken: firebaseMessaging.getToken,
        onMessage: firebaseMessaging.onMessage
      };
    }).catch(error => {
      console.error("Firebase Web Messaging Initialization Error", error);
      return null;
    });
  }

  return webMessagingClientPromise;
};

export const requestFirebaseNotificationPermission = async (userId) => {
  const webMessagingClient = await getWebMessagingClient();
  if (!webMessagingClient || !("Notification" in window)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      let tokenOptions = {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      };

      // Explicitly register the service worker for reliability (crucial for iOS Safari PWA standalone mode)
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          tokenOptions.serviceWorkerRegistration = registration;
          console.log("Service Worker registered successfully for FCM");
        } catch (swErr) {
          console.error("Failed to register Service Worker for FCM:", swErr);
        }
      }

      const currentToken = await webMessagingClient.getToken(webMessagingClient.messaging, tokenOptions);
      if (currentToken) {
        // Save the token to Supabase
        // Note: The table column is 'fcm_token' and unique constraint is 'user_id,fcm_token'
        const { error } = await supabase.from('fcm_tokens').upsert({
          user_id: userId,
          fcm_token: currentToken
        }, { onConflict: 'user_id,fcm_token' });
        
        if (error) {
          console.error("Failed to save FCM token to Supabase:", error);
        } else {
          console.log("FCM Token saved successfully");
        }
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Unable to get permission to notify.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
  }
};

export const onMessageListener = async () => {
  const webMessagingClient = await getWebMessagingClient();
  if (!webMessagingClient) return null;

  return new Promise(resolve => {
    webMessagingClient.onMessage(webMessagingClient.messaging, payload => {
      resolve(payload);
    });
  });
};
