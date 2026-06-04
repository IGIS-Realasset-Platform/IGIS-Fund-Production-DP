import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "./supabaseClient"; // Assuming you have a supabaseClient.js here

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
} catch (err) {
  console.error("Firebase Initialization Error", err);
}

export const requestFirebaseNotificationPermission = async (userId) => {
  if (!messaging) return;
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

      const currentToken = await getToken(messaging, tokenOptions);
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

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
