import { collection, getDocs, doc, getDoc, query, orderBy, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../config/firebase'

/**
 * Crea un nuevo usuario (cliente, motorizado o administrador) usando Cloud Function
 * La Cloud Function maneja la creación en Authentication + Firestore
 * La contraseña por defecto siempre es "123456789"
 * @param {Object} userData - Datos del usuario
 * @param {string} userType - Tipo de usuario: 'cliente', 'motorizado' o 'administrador'
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const createUser = async (userData, userType) => {
  try {
    // Validar tipo de usuario
    if (userType !== 'cliente' && userType !== 'motorizado' && userType !== 'administrador') {
      throw new Error('Tipo de usuario inválido')
    }

    // Llamar a la Cloud Function
    const createUserFunction = httpsCallable(functions, 'createUser')
    const result = await createUserFunction({
      userData,
      userType
    })

    return result.data
  } catch (error) {
    console.error(`Error al crear ${userType}:`, error)

    // Mapear errores comunes
    let errorMessage = error.message
    if (error.code === 'unauthenticated') {
      errorMessage = 'Debes iniciar sesión para crear usuarios'
    } else if (error.code === 'permission-denied') {
      errorMessage = 'No tienes permisos para crear usuarios'
    } else if (error.message.includes('ya está registrado')) {
      errorMessage = 'Este correo electrónico ya está registrado'
    }

    return {
      success: false,
      message: errorMessage
    }
  }
}

/**
 * Crea un nuevo cliente
 * @param {Object} clientData - Datos del cliente
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const createClient = async (clientData) => {
  return createUser(clientData, 'cliente')
}

/**
 * Crea un nuevo motorizado
 * @param {Object} driverData - Datos del motorizado
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const createDriver = async (driverData) => {
  return createUser(driverData, 'motorizado')
}

/**
 * Obtiene todos los motorizados
 * @returns {Promise<Array>} - Array de motorizados
 */
export const getAllDrivers = async () => {
  try {
    const usersRef = collection(db, 'usuarios')
    const q = query(usersRef, where('rol', '==', 'motorizado'))
    const querySnapshot = await getDocs(q)

    const drivers = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      drivers.push({
        id: doc.id,
        name: `${data.nombre} ${data.apellido}`,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        phone: data.telefono,
        status: data.estado || 'active',
        licencia: data.licencia || '-',
        vehiculo: data.vehiculo || {},
        rawData: data
      })
    })

    return drivers
  } catch (error) {
    console.error('Error al obtener motorizados:', error)
    return []
  }
}

/**
 * Busca motorizados por término de búsqueda
 * @param {string} searchTerm - Término a buscar
 * @returns {Promise<Array>} - Array de motorizados que coinciden
 */
export const searchDrivers = async (searchTerm) => {
  try {
    const drivers = await getAllDrivers()

    if (!searchTerm || searchTerm.trim() === '') {
      return drivers
    }

    const term = searchTerm.toLowerCase()

    return drivers.filter(driver =>
      driver.name.toLowerCase().includes(term) ||
      driver.email.toLowerCase().includes(term) ||
      driver.phone.includes(term) ||
      (driver.licencia && driver.licencia.toLowerCase().includes(term)) ||
      (driver.vehiculo?.placa && driver.vehiculo.placa.toLowerCase().includes(term))
    )
  } catch (error) {
    console.error('Error al buscar motorizados:', error)
    throw error
  }
}

/**
 * Obtiene todos los clientes de la colección 'usuarios'
 * @returns {Promise<Array>} - Array de clientes transformados
 */
export const getAllCustomers = async () => {
  try {
    const usersRef = collection(db, 'usuarios')
    const q = query(usersRef, where('rol', '==', 'cliente'))
    const querySnapshot = await getDocs(q)

    const customers = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      customers.push({
        id: doc.id,
        name: data.nombre || '-',
        lastname: data.apellido || '-',
        company: data.empresa || null,
        ruc: data.ruc || null,
        email: data.email || '-',
        phone: data.telefono || '-',
        status: data.estado || 'active',
        rawData: data
      })
    })

    return customers
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    console.log('Mensaje de error:', error?.message)
    console.log('Código del error:', error?.code)
    console.log('Stack trace:', error?.stack)

    return []
  }
}


/**
 * Obtiene un cliente específico por su ID
 * @param {string} customerId - ID del cliente
 * @returns {Promise<Object>} - Cliente transformado
 */
export const getCustomerById = async (customerId) => {
  try {
    const docRef = doc(db, 'usuarios', customerId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Cliente no encontrado')
    }

    const data = docSnap.data()

    // Verificar que sea un cliente
    if (data.rol !== 'cliente') {
      throw new Error('El usuario no es un cliente')
    }

    return {
      id: docSnap.id,
      name: data.nombre || '-',
      company: data.empresa || null,
      ruc: data.ruc || null,
      email: data.email || '-',
      phone: data.telefono || '-',
      status: data.estado || 'active',
      rawData: data
    }
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    throw error
  }
}

/**
 * Busca clientes por término de búsqueda
 * @param {string} searchTerm - Término a buscar
 * @returns {Promise<Array>} - Array de clientes que coinciden
 */
export const searchCustomers = async (searchTerm) => {
  try {
    const customers = await getAllCustomers()

    if (!searchTerm || searchTerm.trim() === '') {
      return customers
    }

    const term = searchTerm.toLowerCase()

    return customers.filter(customer =>
      customer.id.toLowerCase().includes(term) ||
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      (customer.company && customer.company.toLowerCase().includes(term)) ||
      (customer.ruc && customer.ruc.includes(term))
    )
  } catch (error) {
    console.error('Error al buscar clientes:', error)
    throw error
  }
}

/**
 * Obtiene un usuario por su ID (cualquier rol)
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Usuario encontrado
 */
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, 'usuarios', userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Usuario no encontrado')
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    throw error
  }
}

/**
 * Obtiene todos los administradores
 * @returns {Promise<Array>} - Array de administradores
 */
export const getAllAdmins = async () => {
  try {
    const usersRef = collection(db, 'usuarios')
    const q = query(usersRef, where('rol', '==', 'administrador'), orderBy('nombre', 'asc'))
    const querySnapshot = await getDocs(q)

    const admins = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      admins.push({
        id: doc.id,
        name: `${data.nombre} ${data.apellido}`,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        phone: data.telefono,
        status: data.estado || 'active',
        rawData: data
      })
    })

    return admins
  } catch (error) {
    console.error('Error al obtener administradores:', error)
    return []
  }
}

/**
 * Obtiene todos los usuarios (todos los roles)
 * @returns {Promise<Array>} - Array de usuarios
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'usuarios')
    const q = query(usersRef, orderBy('nombre', 'asc'))
    const querySnapshot = await getDocs(q)

    const users = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        name: `${data.nombre} ${data.apellido}`,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        phone: data.telefono,
        rol: data.rol,
        status: data.estado || 'active',
        rawData: data
      })
    })

    return users
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}
