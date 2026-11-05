

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

async function initializeNotifications() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  if (!("Notification" in window) ||
      !("serviceWorker" in navigator)) {
    throw new Error("This browser does not support web notifications.");
  }

  messaging = firebase.messaging();

  messaging.onMessage((payload) => {
    const title = payload.notification?.title || "AttendSmart";
    const body = payload.notification?.body ||
      "You have an attendance update.";

    toast(`${title}: ${body}`);

    // The toast is shown while the app is open.
    // Avoid showing a duplicate browser notification here.
  });
}

async function enableNotifications() {
  try {
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

    localStorage.setItem("attendsmart_fcm_token", token);

    console.log("This browser's FCM token:", token);
    toast("Notifications enabled for this browser.");

    const button = document.getElementById("enableNotifications");
    if (button) {
      button.textContent = "✓ Notifications Enabled";
    }

  } catch (error) {
    console.error("Notification setup error:", error);
    toast("Notification setup failed: " + error.message);
  }
}

async function testNotification() {
  try {
    if (!("Notification" in window)) {
      alert("Browser does not support notifications.");
      return;
    }

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      new Notification("AttendSmart Test", {
        body: "Browser notifications are working!",
        icon: "./favicon.ico"
      });
    } else {
      alert("Notification permission denied.");
    }
  } catch (error) {
    console.error("Test notification error:", error);
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
