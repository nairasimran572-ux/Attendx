
const firebaseConfig = {
  apiKey: "AIzaSyDXid3Q1wiRCNRKSA8qKJ-cBJTTrfedWKw",
  authDomain: "attendx-smart-attendance.firebaseapp.com",
  projectId: "attendx-smart-attendance",
  storageBucket: "attendx-smart-attendance.firebasestorage.app",
  messagingSenderId: "126099640671",
  appId: "1:126099640671:web:dcbd451084a8d649b766ea",
  measurementId: "G-HRWKFL82SG"
};

const VAPID_KEY = "BO8U-2N_B0scsXl7FV29qV6PvKUBBUQUvPHr5QEnZyG46W-brU9gEvtkl_xoLQD9C0s40g6v6U_QvbMnU_ixRAI";

let messaging = null;

async function initializeNotifications() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  messaging = firebase.messaging();

  messaging.onMessage((payload) => {
    const title =
      payload.notification?.title || "AttendSmart";

    const body =
      payload.notification?.body || "You have an attendance update.";

    toast(`${title}: ${body}`);

    // Show a notification while the app is open.
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "./favicon.ico"
      });
    }
  });
}

async function enableNotifications() {
  try {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications.");
    }

    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported.");
    }

    if (!messaging) {
      await initializeNotifications();
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      toast("Notification permission was not granted.");
      return;
    }

    const registration = await navigator.serviceWorker.register(
      "./firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    const token = await messaging.getToken({
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error("Could not generate notification token.");
    }

    // Temporary local storage for this browser.
    localStorage.setItem("attendsmart_fcm_token", token);

    console.log("FCM registration token:", token);

    toast("Notifications enabled successfully!");

    const button = document.getElementById("enableNotifications");

    if (button) {
      button.textContent = "✓ Notifications Enabled";
    }

  } catch (error) {
    console.error("Notification setup error:", error);
    toast("Notification setup failed: " + error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("enableNotifications");

  if (button) {
    button.addEventListener("click", enableNotifications);
  }

  initializeNotifications().catch(error => {
    console.error("Firebase initialization error:", error);
  });
});
