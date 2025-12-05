// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  apiKey: "${process.env.FIREBASE_API_KEY}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
    projectId: "${process.env.FIREBASE_PROJECT_ID}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${process.env.FIREBASE_SENDER_ID}",
    appId: "${process.env.FIREBASE_APP_ID}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID}"

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