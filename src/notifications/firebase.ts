// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, Messaging, getToken } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQyaNNmNty4JmcR96G780i1-P8UyJbaoA",
  authDomain: "bookshop-595a4.firebaseapp.com",
  projectId: "bookshop-595a4",
  storageBucket: "bookshop-595a4.firebasestorage.app",
  messagingSenderId: "693679818735",
  appId: "1:693679818735:web:58b89195945cee33c3181a",
  measurementId: "G-FLDHTJX3J8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging: Messaging = getMessaging(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  console.log(permission);
  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey:
        "BH4nG2wrW7Mw1D3XfRuoWluwV2zPHmqAuQ-JvSJb80RPNvJedS3ZaAG9feU0YYyyCbfJporCdLzNi62wTnDU4eA",
    });
    console.log(token);
  }
};
