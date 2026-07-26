/* Firebase web SDK bootstrap for the partner portal.
   Same Firebase project as the mobile app (config mirrors planieFront), but
   partner accounts are logically separate: the backend refuses app accounts
   on partner endpoints and vice versa. */

import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth";
import { connectStorageEmulator, getStorage } from "firebase/storage";

/* Set REACT_APP_USE_EMULATORS=true (see .env.development.local) to test
   against the local Firebase emulators instead of production. */
export const USE_EMULATORS = process.env.REACT_APP_USE_EMULATORS === "true";

const firebaseConfig = {
  apiKey: "AIzaSyC8oJtqj-eEBkZsAQ4wk3PLioI2lQhDriA",
  authDomain: "planie-app-project.firebaseapp.com",
  projectId: "planie-app-project",
  storageBucket: "planie-app-project.firebasestorage.app",
  messagingSenderId: "7601823771",
  appId: "1:7601823771:web:3cf2854418d36b6897d8be",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (USE_EMULATORS) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
