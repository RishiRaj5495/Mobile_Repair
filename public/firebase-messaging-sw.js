importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };
const firebaseConfig = {
  apiKey: "AIzaSyCdWse7AGWCPKkB-filB8cxR0y6ZZqSxtg",
  authDomain: "mobile-repair-services.firebaseapp.com",
  projectId: "mobile-repair-services",
  storageBucket: "mobile-repair-services.firebasestorage.app",
  messagingSenderId: "974268726688",
  appId: "1:974268726688:web:49ba2c1500b9e9988178c5",
  measurementId: "G-5MDWNS1X2G"
};


firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  const notificationTitle = payload.notification?.title || 'New message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    data: payload.data || {}
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification?.data?.click_action || '/';
  event.waitUntil(clients.openWindow(url));
});