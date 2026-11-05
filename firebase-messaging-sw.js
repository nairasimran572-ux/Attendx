
importScripts('https://www.gstatic.com/firebasejs/13.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.2.0/firebase-messaging-compat.js');

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
  const title = payload.notification?.title || "AttendX Attendance Alert";

  const options = {
    body: payload.notification?.body || "Your child has an attendance update.",
    icon: "./favicon.ico"
  };

  self.registration.showNotification(title, options);
});
