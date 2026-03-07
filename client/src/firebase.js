// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-625ff.firebaseapp.com",
  projectId: "real-estate-625ff",
  storageBucket: "real-estate-625ff.firebasestorage.app",
  messagingSenderId: "995621543313",
  appId: "1:995621543313:web:d15ba5a824667eb1950e30"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);