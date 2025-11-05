import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBght7w4RigEWaPTwknn5mZ7Lrzr16nbrE",
  authDomain: "nanpi-courier.firebaseapp.com",
  projectId: "nanpi-courier",
  storageBucket: "nanpi-courier.appspot.com",
  messagingSenderId: "1040363605459",
  appId: "1:1040363605459:web:0c91de0f7fa83a64d1b326"
}

// Inicializa Firebase
const app = initializeApp(firebaseConfig)

// Inicializa Firestore
export const db = getFirestore(app)

// Inicializa Authentication
export const auth = getAuth(app)

export default app
