// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyCQyaNNmNty4JmcR96G780i1-P8UyJbaoA",
  authDomain: "bookshop-595a4.firebaseapp.com",
  projectId: "bookshop-595a4",
  storageBucket: "bookshop-595a4.firebasestorage.app",
  messagingSenderId: "693679818735",
  appId: "1:693679818735:web:58b89195945cee33c3181a",
  measurementId: "G-FLDHTJX3J8",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png", // Logo bên trái (phải nằm trong public folder)
    image: payload.notification.image, // Hình ảnh bổ sung (tùy chọn)
    data: payload.data, // Dữ liệu bao gồm URL
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url; // Lấy URL từ data
  if (url) {
    event.waitUntil(
      clients.openWindow(url) // Mở URL khi click
    );
  }
});
