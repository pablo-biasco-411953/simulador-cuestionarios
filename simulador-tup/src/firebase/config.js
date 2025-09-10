// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsEH0VGengbPuTjzhr98h_DEIOjH6vlSE",
  authDomain: "simulador-tup.firebaseapp.com",
  projectId: "simulador-tup",
  storageBucket: "simulador-tup.firebasestorage.app",
  messagingSenderId: "93006289928",
  appId: "1:93006289928:web:7d801e78bff645f06f45bd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
