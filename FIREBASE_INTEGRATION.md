# Integración de Firebase con el Proyecto

## Resumen
Se ha integrado Firebase Firestore con la aplicación para obtener datos reales de pedidos desde tu base de datos `nanpi-courier`.

## Archivos Creados/Modificados

### 1. **Configuración de Firebase**
- **Archivo**: `src/config/firebase.js`
- **Descripción**: Inicializa Firebase y Firestore con tus credenciales del proyecto.

### 2. **Utilidades de Transformación**
- **Archivo**: `src/utils/firestoreTransform.js`
- **Descripción**: Contiene funciones para transformar los datos de Firestore REST API al formato que usa la aplicación.
- **Funciones principales**:
  - `extractFirestoreValue()`: Extrae valores de campos de Firestore según su tipo
  - `transformFirestoreOrder()`: Transforma un documento de pedido para la tabla
  - `transformOrderForView()`: Transforma un pedido para la vista de detalles

### 3. **Servicio de Pedidos**
- **Archivo**: `src/services/ordersService.js`
- **Descripción**: API service para obtener pedidos desde Firestore.
- **Funciones**:
  - `getAllOrders()`: Obtiene todos los pedidos
  - `getOrderById(orderId)`: Obtiene un pedido específico
  - `getOrdersWithFilters(filters)`: Obtiene pedidos con filtros aplicados
  - `searchOrders(searchTerm)`: Busca pedidos por término

### 4. **Componentes Actualizados**
- **Orders.jsx**: Ahora carga pedidos reales desde Firebase
  - Incluye estado de carga
  - Manejo de errores
  - Búsqueda en tiempo real

- **OrderView.jsx**: Muestra detalles de un pedido real
  - Carga dinámica de datos
  - Manejo de estados (carga, error, sin datos)
  - Adaptación a datos reales de Firebase

## Cómo Funciona

### Estructura de Datos de Firebase
El sistema espera documentos en Firestore con esta estructura REST API:
```json
{
  "name": "projects/nanpi-courier/databases/(default)/documents/pedidos/ID",
  "fields": {
    "id": { "stringValue": "..." },
    "proveedor": {
      "mapValue": {
        "fields": {
          "nombre": { "stringValue": "..." }
        }
      }
    },
    "destinatario": { "mapValue": { ... } },
    "paquete": { "mapValue": { ... } },
    "pago": { "mapValue": { ... } },
    "fechas": { "mapValue": { ... } },
    "asignacion": { "mapValue": { ... } }
  }
}
```

### API Utilizada
Se utiliza la **Firestore REST API** que no requiere autenticación si las reglas de seguridad están configuradas correctamente:

```
https://firestore.googleapis.com/v1/projects/nanpi-courier/databases/(default)/documents/pedidos
```

## Configuración de Seguridad de Firebase

Para que la aplicación funcione correctamente, necesitas configurar las reglas de seguridad de Firestore:

### Opción 1: Acceso Público (Solo para desarrollo/testing)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pedidos/{pedidoId} {
      allow read: if true;
    }
  }
}
```

### Opción 2: Acceso Autenticado (Recomendado para producción)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pedidos/{pedidoId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Uso

### 1. Iniciar la aplicación
```bash
npm run dev
```

### 2. Navegar a la página de pedidos
La aplicación automáticamente cargará los pedidos desde Firebase al acceder a la ruta `/orders`.

### 3. Buscar pedidos
Usa la barra de búsqueda para filtrar por:
- ID del pedido
- Nombre del cliente (proveedor)
- Nombre del destinatario
- Distrito de recojo
- Distrito de entrega

### 4. Ver detalles de un pedido
Haz clic en el ícono de "Ver detalles" (ojo) en cualquier pedido para ver información completa.

## Mapeo de Estados

El sistema mapea los estados de Firebase a los estados visuales:

| Estado en Firebase | Estado Visual | Color |
|-------------------|---------------|-------|
| Sin fechas de entrega/recojo | Pendiente | Amarillo |
| Con motorizado asignado | Asignado | Amarillo |
| Con fecha de recojo | En Curso | Azul |
| Con fecha de entrega | Entregado | Verde |
| Con fecha de anulación | Cancelado | Rojo |

## Formato de Datos

### Montos
Los montos en Firebase se almacenan en céntimos (centavos), por lo que:
- `monto: 1000` = S/ 10.00
- `comision: 250` = S/ 2.50

### Fechas
Las fechas se transforman automáticamente de `timestampValue` a objetos Date de JavaScript.

### Dimensiones
Las dimensiones del paquete se construyen desde:
- `paquete.dimensiones.largo`
- `paquete.dimensiones.ancho`
- `paquete.dimensiones.alto`

## Troubleshooting

### Error: "Error al obtener pedidos"
**Solución**: Verifica que:
1. Las reglas de seguridad de Firestore permiten lectura pública o tienes autenticación configurada
2. El project ID en `firebase.js` es correcto: `nanpi-courier`
3. Tienes conexión a internet

### Error: "Pedido no encontrado"
**Solución**:
1. Verifica que el ID del pedido existe en tu colección de Firestore
2. Asegúrate de que el formato del ID coincide exactamente (ej: `05-11-2025-075036-766656`)

### Los datos no se muestran correctamente
**Solución**:
1. Revisa la consola del navegador para ver errores
2. Verifica que la estructura de datos en Firebase coincida con la esperada
3. Usa las herramientas de desarrollo para inspeccionar las respuestas de la API

### CORS errors
**Solución**:
- La REST API de Firebase debería manejar CORS automáticamente
- Si tienes problemas, considera usar el SDK de Firebase con autenticación

## Próximos Pasos

Para mejorar la integración:

1. **Autenticación**: Implementar Firebase Authentication para acceso seguro
2. **Tiempo Real**: Usar `onSnapshot` del SDK de Firebase para actualizaciones en tiempo real
3. **Caché**: Implementar caché local para mejorar el rendimiento
4. **Paginación**: Implementar paginación real con Firestore queries
5. **Filtros Avanzados**: Agregar filtros por rango de fechas, monto, etc.
6. **Escritura**: Agregar funcionalidad para crear/editar pedidos

## Contacto y Soporte

Para problemas relacionados con Firebase:
- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [REST API Reference](https://firebase.google.com/docs/firestore/use-rest-api)
