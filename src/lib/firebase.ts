// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtRBIpwJD8gPazi-6G-dOPtMhyRXy4SD8",
  authDomain: "cynoguard-de297.firebaseapp.com",
  projectId: "cynoguard-de297",
  storageBucket: "cynoguard-de297.firebasestorage.app",
  messagingSenderId: "441938178282",
  appId: "1:441938178282:web:b137c170552f0fb73ae793",
  measurementId: "G-5M8EHFXJEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
