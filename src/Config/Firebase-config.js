
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBNIpXjOcwwb-1MIv3Mua3umoKV93OJaa8",
  authDomain: "expense-tracker-a80a0.firebaseapp.com",
  projectId: "expense-tracker-a80a0",
  storageBucket: "expense-tracker-a80a0.appspot.com",
  messagingSenderId: "183302504720",
  appId: "1:183302504720:web:d241923b5794ecb0b5a595",
  measurementId: "G-1WB08GL3R5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
