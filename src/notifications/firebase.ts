// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  Messaging,
  getToken,
  deleteToken,
  onMessage,
} from "firebase/messaging";
import { notification } from "antd";
import { removeDeviceTokenAPI, saveDeviceTokenAPI } from "@/services/api";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging: Messaging = getMessaging(app);

export const generateToken = async (userId: number) => {
  try {
    const permission = await Notification.requestPermission();
    console.log(">>> Permission:", permission);
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      console.log(">>> Device Token:", token);

      // Lưu token vào localStorage
      localStorage.setItem("deviceToken", token);

      // Gửi token lên backend
      // await fetch("http://localhost:8080/api/v1/users/device-token", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      //   },
      //   body: JSON.stringify({ userId, token, deviceType: "WEB" }),
      // });

      await saveDeviceTokenAPI({
        userId,
        deviceToken: token,
        deviceType: "WEB",
      });
      console.log("Token sent to backend");
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
};

export const removeToken = async (userId: number, deviceToken: string) => {
  try {
    // Gửi yêu cầu xóa token khỏi backend
    // await fetch("http://localhost:8080/api/v1/users/remove-device-token", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    //   },
    //   body: JSON.stringify({ userId, token, deviceType: "WEB" }),
    // });
    await removeDeviceTokenAPI({ userId, deviceToken, deviceType: "WEB" });
    console.log("Token removed from backend");

    // Xóa token khỏi trình duyệt
    await deleteToken(messaging);
    console.log("Token deleted from FCM");

    // Xóa token khỏi localStorage
    localStorage.removeItem("deviceToken");
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const setupForegroundNotification = (messaging: Messaging) => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);

    const image = payload.notification?.image || payload.data?.image;
    const url = payload.data?.url;
    const title = payload.notification?.title || "";
    const body = payload.notification?.body || "";

    const simpleMessage = image ? `🖼️ ${title}` : title;
    const simpleDescription = url
      ? `${body}\n\n👆 Click để xem chi tiết`
      : body;

    notification.open({
      message: simpleMessage,
      description: simpleDescription,
      duration: 8,
      onClick: () => {
        if (url) window.location.href = url;
      },
      style: {
        cursor: url ? "pointer" : "default",
      },
      // Có thể thêm className để custom CSS
      className: "custom-firebase-notification",
    });
  });
};
