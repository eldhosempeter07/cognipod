import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const firebaseConfig2 = {
  apiKey: process.env.REACT_APP_KEY2,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN2,
  projectId: process.env.REACT_APP_PROJECT_ID2,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET2,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID2,
  appId: process.env.REACT_APP_APP_ID2,
};

const app = initializeApp(firebaseConfig);
const app2 = initializeApp(firebaseConfig2, "storage");
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app2);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider, db, storage };
