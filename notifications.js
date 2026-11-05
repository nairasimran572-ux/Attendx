

const firebaseConfig = {
  apiKey: "AIzaSyDXid3Q1wiRCNRKSA8qKJ-cBJTTrfedWKw",
  authDomain: "attendx-smart-attendance.firebaseapp.com",
  projectId: "attendx-smart-attendance",
  storageBucket: "attendx-smart-attendance.firebasestorage.app",
  messagingSenderId: "126099640671",
  appId: "1:126099640671:web:dcbd451084a8d649b766ea",
  measurementId: "G-HRWKFL82SG"
};

const VAPID_KEY =
  "BO8U-2N_B0scsXl7FV29qV6PvKUBBUQUvPHr5QEnZyG46W-brU9gEvtkl_xoLQD9C0s40g6v6U_QvbMnU_ixRAI";

let messaging = null;
let foregroundListenerAdded = false;

async function initializeNotifications() {
  if (!window.firebase) {
    throw new Error("Firebase SDK did not load.");
  }

  if (!("Notification" in window) ||
      !("serviceWorker" in navigator)) {
    throw new Error("This browser does not support web notifications.");
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  if (!firebase.messaging.isSupported ||
      !(await firebase.messaging.isSupported())) {
    throw new Error("Firebase Messaging is not supported in this browser.");
  }

  messaging = firebase.messaging();

  if (!foregroundListenerAdded) {
    messaging.onMessage((payload) => {
      const title =
        payload.data?.title ||
        payload.notification?.title ||
        "AttendSmart";

      const body =
        payload.data?.body ||
        payload.notification?.body ||
        "You have an attendance update.";

      if (typeof window.toast === "function") {
        window.toast(`${title}: ${body}`);
      } else {
        console.log(`${title}: ${body}`);
      }
    });

    foregroundListenerAdded = true;
  }

  return messaging;
}

async function enableNotifications() {
  try {
    if (!messaging) {
      await initializeNotifications();
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error("Notification permission was not granted.");
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
      throw new Error("Could not generate an FCM token.");
    }

    localStorage.setItem("attendsmart_fcm_token", token);

    console.log("FCM browser token generated.");

    if (typeof window.toast === "function") {
      window.toast("Notifications enabled for this browser.");
    }

    const button = document.getElementById("enableNotifications");

    if (button) {
      button.textContent = "✓ Notifications Enabled";
    }

    return token;

  } catch (error) {
    console.error("Notification setup error:", error);

    if (typeof window.toast === "function") {
      window.toast("Notification setup failed: " + error.message);
    }

    return null;
  }
}

async function testNotification() {
  try {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      alert("Please allow notifications in your browser settings.");
      return;
    }

    new Notification("AttendSmart Test", {
      body: "Browser notifications are working!",
      icon: "./favicon.ico"
    });

  } catch (error) {
    console.error("Test notification error:", error);
    alert("Could not show the test notification: " + error.message);
  }
}

window.enableNotifications = enableNotifications;
window.testNotification = testNotification;

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("enableNotifications");

  if (button) {
    button.addEventListener("click", enableNotifications);
  }

  initializeNotifications().catch(error => {
    console.error("Firebase initialization error:", error);
  });
});
