import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC26memjD9OkQ_KSbEqNntiWLRo-Mu7_pM",
  authDomain: "project-2973122267880605386.firebaseapp.com",
  projectId: "project-2973122267880605386",
  storageBucket: "project-2973122267880605386.firebasestorage.app",
  messagingSenderId: "851796764231",
  appId: "1:851796764231:web:eaa60825e03bdd274cb362",
  measurementId: "G-TER82RJY2C"
};

// Initialize Firebase (방어 로직 포함: Next.js에서 중복 초기화 방지)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
