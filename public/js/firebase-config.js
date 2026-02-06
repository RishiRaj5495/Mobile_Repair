
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
window.messaging = firebase.messaging();
console.log("Messaging from config =", window.messaging);
console.log("Firebase initialized");