// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDPaSBnodweKse_tAGwb6NxcPTGji93O38",
    authDomain: "smart-pricing-intelligence.firebaseapp.com",
    projectId: "smart-pricing-intelligence",
    storageBucket: "smart-pricing-intelligence.firebasestorage.app",
    messagingSenderId: "663971682021",
    appId: "1:663971682021:web:0a870433f84eeff21e660c",
    measurementId: "G-LWTT4Q23EQ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
