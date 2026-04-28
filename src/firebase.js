import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB9Qfzrisdv-jk6Ys1etCDBoRjbZVZ4iBk",
  authDomain: "hm-sportcars.firebaseapp.com",
  projectId: "hm-sportcars",
  storageBucket: "hm-sportcars.firebasestorage.app",
  messagingSenderId: "1043149245315",
  appId: "1:1043149245315:web:0c9558992b331b360fc4b6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
