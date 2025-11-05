import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar datos del usuario desde Firestore
  const loadUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid))
      if (userDoc.exists()) {
        return userDoc.data()
      }
      return null
    } catch (err) {
      console.error('Error cargando datos del usuario:', err)
      return null
    }
  }

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario autenticado
        setUser(user)

        // Cargar datos adicionales del usuario desde Firestore
        const data = await loadUserData(user.uid)
        setUserData(data)
      } else {
        // No hay usuario autenticado
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Función de login
  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Cargar datos adicionales
      const data = await loadUserData(user.uid)
      setUserData(data)

      return { success: true, user, userData: data }
    } catch (err) {
      console.error('Error en login:', err)

      let errorMessage = 'Error al iniciar sesión'

      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'El correo electrónico no es válido'
          break
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada'
          break
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo'
          break
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta'
          break
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde'
          break
        default:
          errorMessage = err.message
      }

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Función de logout
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserData(null)
      return { success: true }
    } catch (err) {
      console.error('Error en logout:', err)
      return { success: false, error: err.message }
    }
  }

  // Verificar si el usuario es admin
  const isAdmin = () => {
    if (!userData) return false
    const rol = userData.rol?.toLowerCase()
    return rol === 'admin' || rol === 'administrador'
  }

  // Verificar si el usuario es motorizado
  const isMotorizado = () => {
    if (!userData) return false
    const rol = userData.rol?.toLowerCase()
    return rol === 'motorizado'
  }

  // Verificar si el usuario es cliente
  const isCliente = () => {
    if (!userData) return false
    const rol = userData.rol?.toLowerCase()
    return rol === 'cliente'
  }

  const value = {
    user,
    userData,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isMotorizado,
    isCliente
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
