import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5R_LLcwSmyoZvevhTae344zIxgWwM44Q",
  authDomain: "aaramly-2f55d.firebaseapp.com",
  projectId: "aaramly-2f55d",
  storageBucket: "aaramly-2f55d.firebasestorage.app",
  messagingSenderId: "558327938195",
  appId: "1:558327938195:web:3b6169ac708de07ad1a166",
  measurementId: "G-RL6R6HLESW",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics deferred after window load during idle time to avoid blocking initial paint
if (typeof window !== "undefined") {
  const initAnalytics = () => {
    isSupported().then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    });
  };

  const scheduleAnalytics = () => {
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(initAnalytics, { timeout: 8000 });
    } else {
      setTimeout(initAnalytics, 5000);
    }
  };

  if (document.readyState === "complete") {
    scheduleAnalytics();
  } else {
    window.addEventListener("load", scheduleAnalytics, { once: true });
  }
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export {
  app,
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateFirebaseProfile,
};
export type { FirebaseUser };
