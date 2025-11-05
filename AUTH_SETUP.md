# Sistema de Autenticación Firebase

## Resumen
Se ha implementado un sistema completo de autenticación con Firebase Authentication que funciona con tus reglas de seguridad de Firestore.

## Archivos Creados/Modificados

### Nuevos Archivos:

1. **src/contexts/AuthContext.jsx**
   - Contexto de React para manejar el estado de autenticación
   - Funciones: `login()`, `logout()`, `isAdmin()`, `isMotorizado()`, `isCliente()`
   - Carga automática de datos del usuario desde Firestore

2. **src/pages/Login.jsx**
   - Página de inicio de sesión
   - Diseño moderno y responsivo
   - Validación de campos
   - Mensajes de error claros

3. **src/components/ProtectedRoute.jsx**
   - Componente para proteger rutas que requieren autenticación
   - Redirige a login si no hay usuario autenticado
   - Muestra spinner mientras verifica autenticación

### Archivos Modificados:

1. **src/config/firebase.js**
   - Se agregó inicialización de Firebase Authentication
   - Exporta `auth` para usar en toda la aplicación

2. **src/App.jsx**
   - Envuelto en `AuthProvider` para acceso global al contexto
   - Rutas separadas en públicas (login) y protegidas (resto)
   - Todas las rutas principales ahora requieren autenticación

3. **src/components/layout/Header.jsx**
   - Muestra información del usuario logueado
   - Muestra el rol del usuario
   - Botón de logout funcional

4. **src/services/ordersService.js**
   - Migrado de REST API a Firebase SDK
   - Ahora usa autenticación automática
   - Compatible con tus reglas de seguridad de Firestore

## Cómo Funciona

### Flujo de Autenticación:

1. **Usuario no autenticado**:
   - Al acceder a cualquier ruta → Redirige a `/login`
   - Muestra formulario de login

2. **Login exitoso**:
   - Verifica credenciales con Firebase Authentication
   - Carga datos del usuario desde `usuarios/{uid}` en Firestore
   - Almacena usuario y datos en el contexto
   - Redirige a `/orders`

3. **Usuario autenticado**:
   - Puede acceder a todas las rutas protegidas
   - Header muestra su nombre y rol
   - Firebase SDK usa automáticamente el token de autenticación

4. **Logout**:
   - Cierra sesión en Firebase
   - Limpia el contexto
   - Redirige a `/login`

### Verificación de Roles:

El sistema verifica roles de dos formas (en orden de prioridad):

1. **Custom Claims** (más eficiente): `request.auth.token.rol`
2. **Firestore** (fallback): Consulta el documento del usuario

## Uso en Componentes

### Hook useAuth:

```jsx
import { useAuth } from '../contexts/AuthContext'

function MiComponente() {
  const { user, userData, isAdmin, logout } = useAuth()

  return (
    <div>
      <p>Usuario: {userData?.nombre || user?.email}</p>
      <p>Rol: {userData?.rol}</p>
      {isAdmin() && <button>Solo admins ven esto</button>}
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

### Propiedades del contexto:

- `user`: Objeto de Firebase Authentication (uid, email, etc.)
- `userData`: Datos del usuario desde Firestore (nombre, rol, etc.)
- `loading`: Boolean - true mientras verifica autenticación
- `error`: String - mensaje de error si hay alguno
- `login(email, password)`: Función para iniciar sesión
- `logout()`: Función para cerrar sesión
- `isAdmin()`: Boolean - verifica si es administrador
- `isMotorizado()`: Boolean - verifica si es motorizado
- `isCliente()`: Boolean - verifica si es cliente

## Iniciar Sesión

### Credenciales:

Usa las credenciales de tu usuario admin existente en Firebase:

- **Email**: Tu email de admin
- **Password**: Tu contraseña de admin

### Proceso:

1. Abre la aplicación: `http://localhost:3001`
2. Serás redirigido automáticamente a `/login`
3. Ingresa email y contraseña
4. Click en "Iniciar Sesión"
5. Si las credenciales son correctas, serás redirigido a `/orders`

## Estructura de Datos Esperada

### En Firebase Authentication:
```
UID: "abc123..."
Email: "admin@nanpi.com"
```

### En Firestore (usuarios/{uid}):
```javascript
{
  nombre: "Admin Usuario",
  email: "admin@nanpi.com",
  rol: "Admin",  // o "Motorizado", "Cliente"
  // ... otros campos
}
```

## Seguridad

### Reglas de Firestore Compatibles:

El sistema funciona con tus reglas actuales porque:

1. **Usa el SDK de Firebase**: Las solicitudes incluyen automáticamente el token de autenticación
2. **request.auth está disponible**: Firebase inyecta el objeto auth en cada solicitud
3. **Roles verificables**: Puede usar tanto custom claims como Firestore

### Flujo de seguridad:

```
Usuario hace login
    ↓
Firebase Authentication genera token JWT
    ↓
SDK incluye token en cada solicitud a Firestore
    ↓
Reglas de seguridad verifican token y permisos
    ↓
Concede o deniega acceso
```

## Mensajes de Error

El sistema maneja estos errores de autenticación:

- `auth/invalid-email`: "El correo electrónico no es válido"
- `auth/user-disabled`: "Esta cuenta ha sido deshabilitada"
- `auth/user-not-found`: "No existe una cuenta con este correo"
- `auth/wrong-password`: "Contraseña incorrecta"
- `auth/invalid-credential`: "Credenciales inválidas"
- `auth/too-many-requests`: "Demasiados intentos fallidos"

## Testing

### Verificar que funciona:

1. **Sin autenticación**:
   ```
   1. Abrir navegador de incógnito
   2. Ir a http://localhost:3001/orders
   3. Deberías ser redirigido a /login
   ```

2. **Con autenticación**:
   ```
   1. Login con credenciales válidas
   2. Deberías ver la página de pedidos
   3. Header debe mostrar tu nombre y rol
   4. Pedidos deben cargarse desde Firestore
   ```

3. **Logout**:
   ```
   1. Click en botón "Salir" en el header
   2. Deberías ser redirigido a /login
   3. Intentar acceder a /orders → redirige a /login
   ```

## Troubleshooting

### Error: "Error al cargar los pedidos"

**Causa**: Las reglas de Firestore están bloqueando el acceso

**Solución**:
1. Verifica que el usuario esté autenticado correctamente
2. Verifica que el rol del usuario permita lectura de pedidos
3. Revisa la consola del navegador para ver el error específico

### Error: "Credenciales inválidas"

**Causa**: Email o contraseña incorrectos

**Solución**:
1. Verifica el email en Firebase Console → Authentication
2. Resetea la contraseña si es necesario
3. Asegúrate de que el usuario esté habilitado

### No se muestra el nombre del usuario

**Causa**: El documento del usuario no existe en Firestore

**Solución**:
1. Ve a Firebase Console → Firestore
2. Verifica que existe `usuarios/{uid}`
3. Verifica que tiene un campo `nombre`

### El logout no funciona

**Causa**: Error en la función de logout

**Solución**:
1. Revisa la consola del navegador
2. Verifica que Firebase esté inicializado correctamente
3. Limpia caché y cookies del navegador

## Próximos Pasos

### Mejoras sugeridas:

1. **Recuperación de contraseña**:
   - Implementar "Olvidé mi contraseña"
   - Usar `sendPasswordResetEmail` de Firebase

2. **Registro de usuarios**:
   - Formulario de registro (solo para admins)
   - Validación de datos

3. **Persistencia de sesión**:
   - Ya está implementada por defecto en Firebase
   - El usuario permanece logueado después de cerrar el navegador

4. **Múltiples métodos de autenticación**:
   - Google Sign-In
   - Login con teléfono

5. **Tokens de refresh automático**:
   - Ya manejado por Firebase automáticamente
   - Los tokens se refrescan cada hora

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## Recursos

- [Documentación Firebase Auth](https://firebase.google.com/docs/auth)
- [Reglas de Seguridad Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [React Context API](https://react.dev/reference/react/useContext)
