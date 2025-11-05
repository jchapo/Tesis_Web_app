# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno necesarias para el proyecto.

## Variables de Entorno Requeridas

El proyecto necesita las siguientes credenciales y API keys:

### Firebase Configuration
- `VITE_FIREBASE_API_KEY` - API Key de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN` - Dominio de autenticación
- `VITE_FIREBASE_PROJECT_ID` - ID del proyecto
- `VITE_FIREBASE_STORAGE_BUCKET` - Bucket de almacenamiento
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - ID del remitente de mensajes
- `VITE_FIREBASE_APP_ID` - ID de la aplicación

### Google Maps API
- `VITE_GOOGLE_MAPS_API_KEY` - API Key de Google Maps Geocoding

## Pasos para Configurar

### 1. Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto copiando el archivo de ejemplo:

```bash
cp .env.example .env
```

### 2. Obtener las Credenciales

#### Firebase Credentials:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "nanpi-courier"
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. En la sección **Tus aplicaciones**, busca la app web
5. Copia los valores de configuración

#### Google Maps API Key:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs y servicios > Credenciales**
4. Busca tu API Key existente o crea una nueva
5. Asegúrate de que tenga habilitada la API de **Geocoding**

### 3. Completar el archivo .env

Edita el archivo `.env` y reemplaza los valores de ejemplo con tus credenciales reales:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBght7w4RigEWaPTwknn5mZ7Lrzr16nbrE
VITE_FIREBASE_AUTH_DOMAIN=nanpi-courier.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nanpi-courier
VITE_FIREBASE_STORAGE_BUCKET=nanpi-courier.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1040363605459
VITE_FIREBASE_APP_ID=1:1040363605459:web:0c91de0f7fa83a64d1b326

# Google Maps Geocoding API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCuJ6KpGRjj...tu_api_key_aqui
```

### 4. Reiniciar el servidor de desarrollo

Después de crear o modificar el archivo `.env`, reinicia el servidor:

```bash
npm run dev
```

## Seguridad

### ⚠️ IMPORTANTE:

1. **NUNCA** commits el archivo `.env` al repositorio
2. El archivo `.env` ya está en `.gitignore` para proteger tus credenciales
3. Comparte las credenciales solo de forma segura con tu equipo
4. En producción, configura las variables de entorno en tu plataforma de hosting

### Verificar que .env está ignorado:

```bash
git status
```

El archivo `.env` NO debe aparecer en la lista de archivos modificados.

## Troubleshooting

### Error: "Cannot read properties of undefined"

Si ves este error al crear un pedido, verifica que:
1. El archivo `.env` existe en la raíz del proyecto
2. Todas las variables tienen el prefijo `VITE_`
3. Has reiniciado el servidor después de crear el archivo

### Error de Geocoding: "Invalid API Key"

1. Verifica que la API Key de Google Maps es correcta
2. Asegúrate de que la API de Geocoding está habilitada en Google Cloud Console
3. Verifica que la API Key no tenga restricciones que bloqueen solicitudes desde localhost

### Fallback Configuration

Si no configuras las variables de entorno, la aplicación usará valores por defecto para Firebase. Sin embargo, **debes configurar** `VITE_GOOGLE_MAPS_API_KEY` para que la geocodificación funcione correctamente.

## Estructura del Proyecto

```
/home/juan-alfonso/Documents/webApp/
├── .env                    # ⚠️ NO COMMITEAR - Credenciales reales
├── .env.example            # ✅ Template para el equipo
├── .gitignore              # ✅ Incluye .env
├── src/
│   ├── config/
│   │   └── firebase.js     # Lee variables de entorno
│   ├── utils/
│   │   └── geocoding.js    # Usa VITE_GOOGLE_MAPS_API_KEY
│   └── services/
│       └── orderCreateService.js
```

## Ubicación de las Keys en el AppsScript Original

En tu script de Google Apps Script, las credenciales estaban definidas así:

```javascript
const email = "firebase-writer-account@nanpi-courier.iam.gserviceaccount.com"
const key = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
const projectId = "nanpi-courier"
const API_KEY = 'AIz...3'  // Google Maps Geocoding API Key
```

En la aplicación web React:
- **No necesitas** el service account email y private key (usamos Firebase SDK del cliente)
- **Sí necesitas** las credenciales de Firebase Web App
- **Sí necesitas** el Google Maps API Key para geocodificación

## Referencias

- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/start)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
