import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBght7w4RigEWaPTwknn5mZ7Lrzr16nbrE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nanpi-courier.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nanpi-courier",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nanpi-courier.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1040363605459",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1040363605459:web:0c91de0f7fa83a64d1b326"
}

// Inicializa Firebase
const app = initializeApp(firebaseConfig)

// Inicializa Firestore
export const db = getFirestore(app)

// Inicializa Authentication
export const auth = getAuth(app)

export default app
