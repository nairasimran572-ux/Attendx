

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDXid3Q1wiRCNRKSA8qKJ-cBJTTrfedWKw",
  authDomain: "attendx-smart-attendance.firebaseapp.com",
  projectId: "attendx-smart-attendance",
  storageBucket: "attendx-smart-attendance.firebasestorage.app",
  messagingSenderId: "126099640671",
  appId: "1:126099640671:web:dcbd451084a8d649b766ea",
  measurementId: "G-HRWKFL82SG"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Display only data-only messages here.
  // Notification payloads may already be displayed automatically by FCM.
  const title = payload.data?.title || "AttendSmart Attendance Alert";

  const options = {
    body:
      payload.data?.body ||
      "Your child has an attendance update.",
    icon: "./favicon.ico",
    data: {
      url: "./"
    }
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow("./");
      }
    })
  );
});
