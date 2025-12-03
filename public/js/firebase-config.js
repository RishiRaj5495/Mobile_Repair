// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdWse7AGWCPKkB-filB8cxR0y6ZZqSxtg",
  authDomain: "mobile-repair-services.firebaseapp.com",
  projectId: "mobile-repair-services",
  storageBucket: "mobile-repair-services.firebasestorage.app",
  messagingSenderId: "974268726688",
  appId: "1:974268726688:web:49ba2c1500b9e9988178c5",
  measurementId: "G-5MDWNS1X2G"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);



// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// // ⭐ ADD THIS ⭐
//  export const messaging = getMessaging(app);




//  firebase.initializeApp(firebaseConfig);

// Get messaging instance
// if (firebase.analytics) {
//   firebase.analytics();
// }
// const messaging = firebase.messaging();
firebase.initializeApp(firebaseConfig);
window.messaging = firebase.messaging();
console.log("Messaging from config =", window.messaging);
console.log("Firebase initialized");