/* Firebase web SDK bootstrap for the partner portal.
   Same Firebase project as the mobile app (config mirrors planieFront), but
   partner accounts are logically separate: the backend refuses app accounts
   on partner endpoints and vice versa. */

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { connectAuthEmulator, getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
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

/* App Check. This project ENFORCES App Check on Firebase Authentication (and
   Firestore — see the backend's mintQaAppCheckToken.ts), so without a token
   every sign-in call is rejected outright:

     HTTP 401 "Firebase App Check token is invalid."

   which the JS SDK surfaces as the unhelpful `auth/internal-error`. Nothing
   auth-related in this app works until this is initialised, which is why it
   runs before getAuth().

   The site key is a reCAPTCHA v3 PUBLIC key — safe in the bundle, and useless
   without the matching domain allowlist. Set REACT_APP_APPCHECK_SITE_KEY in
   .env / the Netlify build environment. Register the key against this web app
   in Firebase console → App Check.

   In development, set REACT_APP_APPCHECK_DEBUG_TOKEN=true, read the debug
   token the SDK prints to the console once, and add it under App Check →
   Manage debug tokens. reCAPTCHA v3 cannot verify localhost otherwise. */
const APPCHECK_SITE_KEY = process.env.REACT_APP_APPCHECK_SITE_KEY;
const APPCHECK_DEBUG = process.env.REACT_APP_APPCHECK_DEBUG_TOKEN;

if (APPCHECK_DEBUG && process.env.NODE_ENV !== "production") {
  // `true` makes the SDK mint and log a fresh debug token; a token string
  // reuses one already registered.
  // `window`, not `self` — CRA's eslint config bans the latter as ambiguous
  // between window and a worker scope. The SDK reads either.
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = APPCHECK_DEBUG === "true" ? true : APPCHECK_DEBUG;
}

if (APPCHECK_SITE_KEY && !USE_EMULATORS) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(APPCHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
} else if (!USE_EMULATORS) {
  // Loud on purpose: the symptom (every sign-in failing with an "internal"
  // error) gives no hint at all about the missing key.
  console.warn(
    "[firebase] REACT_APP_APPCHECK_SITE_KEY is not set. App Check is enforced on " +
    "this project, so all sign-in attempts will fail with auth/internal-error.",
  );
}

export const auth = getAuth(app);
export const storage = getStorage(app);

if (USE_EMULATORS) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/* Sign in with Apple. Unlike Google this needs its own setup in the Firebase
   console (Apple Services ID + key) before the popup will do anything but
   error — web Apple sign-in is NOT covered by the iOS app's configuration. */
export const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");
