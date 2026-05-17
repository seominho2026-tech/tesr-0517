import { initializeApp, getApps, getApp } from 'firebase/app';
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

// Initialize Firebase (중복 초기화 방지)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 이제 로그인(Auth)은 안 쓰고 데이터베이스(Firestore)만 사용합니다.
const db = getFirestore(app);

export { db };
