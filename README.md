# Gestión de Pedidos Diarios - Logística

Aplicación web para gestión de pedidos de logística, construida con React, Vite y Tailwind CSS.

## Estructura del Proyecto

```
webApp/
├── src/
│   ├── components/
│   │   ├── common/          # Componentes reutilizables
│   │   └── layout/          # Componentes de layout
│   │       ├── Layout.jsx   # Layout principal
│   │       ├── Sidebar.jsx  # Sidebar vertical con íconos
│   │       └── Header.jsx   # Header con búsqueda
│   ├── pages/               # Páginas de la aplicación
│   │   └── Orders.jsx       # Página de gestión de pedidos
│   ├── hooks/               # Custom hooks
│   ├── services/            # Servicios y APIs
│   ├── utils/               # Utilidades
│   ├── assets/              # Recursos estáticos
│   ├── styles/              # Estilos globales
│   │   └── index.css        # Tailwind imports
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm run dev
```

3. Abrir en el navegador:
```
http://localhost:3000
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter

## Características

- Interfaz moderna con Tailwind CSS
- Modo oscuro activado por defecto
- Sidebar vertical compacto con íconos Material Symbols
- Tabla completa de pedidos con:
  - Estados (Pendiente, En Curso, Entregado, Cancelado)
  - Información de cliente y destinatario
  - Distritos de recojo y entrega
  - Dimensiones y volumen
  - Estimación por IA
  - Motorizado asignado
  - Fechas de creación y entrega
  - Montos
- Búsqueda y filtros
- Paginación
- Botones de acción por pedido
- Responsive design

## Próximos Pasos

1. Integrar con API backend
2. Implementar funcionalidad de búsqueda en tiempo real
3. Añadir modales para crear/editar pedidos
4. Implementar asignación de motorizados
5. Agregar tracking en tiempo real con mapas
6. Crear páginas de Dashboard, Motorizados, Clientes y Reportes
7. Implementar autenticación de usuarios
8. Añadir sistema de notificaciones

## Tecnologías

- React 18
- Vite 6
- Tailwind CSS 3
- React Router 6
- Material Symbols (Google Icons)
- Inter Font
