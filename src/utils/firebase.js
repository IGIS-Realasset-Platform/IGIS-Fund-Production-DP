import { Capacitor } from "@capacitor/core";
import { supabase } from "./supabaseClient";
import { getWorkFeedNotificationTarget } from './notificationState';

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

const registrations = new Map();
let stopForegroundMessages;

export function getBrowserPushStatus() {
  if (Capacitor.isNativePlatform()) return 'native';
  if (!window.isSecureContext) return 'insecure';
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  return Notification.permission;
}

export const requestFirebaseNotificationPermission = async (userId, { prompt = false } = {}) => {
  if (!userId) return { status: 'signed-out' };
  let status = getBrowserPushStatus();
  // Safari requires this call directly inside the button's user gesture, before any await/import.
  if (status === 'default' && prompt) status = await Notification.requestPermission();
  if (status !== 'granted') return { status };
  if (registrations.has(userId)) return registrations.get(userId);

  const pending = (async () => {
    const client = await getWebMessagingClient();
    if (!client) return { status: 'unsupported' };
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
    const token = await client.getToken(client.messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) throw new Error('푸시 구독을 만들지 못했습니다. 다시 연결해 주세요.');
    const { error } = await supabase.from('fcm_tokens').upsert({
      user_id: userId, fcm_token: token, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,fcm_token' });
    if (error) throw error;
    if (!stopForegroundMessages) {
      stopForegroundMessages = client.onMessage(client.messaging, payload => {
        const data = payload.data || {};
        const url = getWorkFeedNotificationTarget(data) || '/platform/iotaseoul/workflow';
        registration.showNotification(payload.notification?.title || 'IOTA Seoul 알림', {
          body: payload.notification?.body || '', icon: '/icons/iota-app-icon-v2-192.png',
          tag: data.notification_id || payload.messageId, data: { url },
        }).catch(error => console.warn('브라우저 알림 표시 실패', error));
      });
    }
    return { status: 'connected' };
  })().catch(error => {
    console.error('브라우저 푸시 연결 실패', error);
    return { status: 'error' };
  }).finally(() => registrations.delete(userId));
  registrations.set(userId, pending);
  return pending;
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
