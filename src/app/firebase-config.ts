import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyA-zKoE2W9lcZ0TIp0Dx0YgFxERwo7_2vM",
  authDomain: "proyecto-naula-mendez.firebaseapp.com",
  projectId: "proyecto-naula-mendez",
  storageBucket: "proyecto-naula-mendez.firebasestorage.app",
  messagingSenderId: "220939884279",
  appId: "1:220939884279:web:78899cd4693ec7da8de5f2",
  measurementId: "G-19ZNYD9RE0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      getAnalytics(app);
      console.log('✅ Firebase Analytics activado');
    } else {
      console.warn('⚠️ Firebase Analytics no soportado en este entorno');
    }
  });
}