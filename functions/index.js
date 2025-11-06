const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();

/**
 * Cloud Function para crear usuarios con Authentication + Firestore
 * Para desarrollo: Permite crear usuarios sin autenticación si no existen administradores
 * Para producción: Solo usuarios autenticados con rol 'administrador' pueden llamar esta función
 */
exports.createUser = onCall(async (request) => {
  const { userData, userType } = request.data;

  // Validar tipo de usuario
  if (!['cliente', 'motorizado', 'administrador'].includes(userType)) {
    throw new HttpsError('invalid-argument', 'Tipo de usuario inválido');
  }

  // Validar datos requeridos
  if (!userData.email || !userData.nombre || !userData.apellido || !userData.telefono) {
    throw new HttpsError('invalid-argument', 'Faltan datos obligatorios');
  }

  // Verificar si hay administradores en el sistema
  const adminsSnapshot = await admin.firestore()
    .collection('usuarios')
    .where('rol', '==', 'administrador')
    .limit(1)
    .get();

  const hasAdmins = !adminsSnapshot.empty;

  // Si ya existen administradores, verificar autenticación y permisos
  if (hasAdmins) {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'El usuario debe estar autenticado');
    }

    const callerUid = request.auth.uid;
    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();

    if (!callerDoc.exists || callerDoc.data().rol !== 'administrador') {
      throw new HttpsError('permission-denied', 'Solo los administradores pueden crear usuarios');
    }
  }

  try {
    // Contraseña por defecto
    const DEFAULT_PASSWORD = '123456789';

    // 1. Crear usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: userData.email,
      password: DEFAULT_PASSWORD,
      displayName: `${userData.nombre} ${userData.apellido}`,
    });

    const uid = userRecord.uid;

    // 2. Preparar datos según el tipo
    const baseData = {
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      telefono: userData.telefono,
      rol: userType,
      estado: 'active',
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Agregar datos empresariales si es cliente
    if (userType === 'cliente' && userData.datosEmpresariales) {
      baseData.empresa = userData.empresa || null;
      baseData.ruc = userData.ruc || null;
      baseData.razonSocial = userData.razonSocial || null;
    }

    // Agregar datos específicos de motorizado
    if (userType === 'motorizado') {
      baseData.vehiculo = {
        placa: userData.vehiculoPlaca || null,
        modelo: userData.vehiculoModelo || null,
        color: userData.vehiculoColor || null,
      };
      baseData.licencia = userData.licencia || null;
    }

    // 3. Guardar en Firestore usando el UID como ID del documento
    await admin.firestore().collection('usuarios').doc(uid).set(baseData);

    return {
      success: true,
      userId: uid,
      message: `${userType === 'cliente' ? 'Cliente' : userType === 'motorizado' ? 'Motorizado' : 'Administrador'} creado exitosamente`,
    };
  } catch (error) {
    console.error('Error al crear usuario:', error);

    // Mapear errores comunes
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Este correo electrónico ya está registrado';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'El correo electrónico no es válido';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'La contraseña es demasiado débil';
    }

    throw new HttpsError('internal', errorMessage);
  }
});
