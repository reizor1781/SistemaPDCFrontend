# 🎡 Frontend — Parque del Café Planimetría

Interfaz web construida con **React + TypeScript + Vite**, usando **Material UI** como librería de componentes.

---

## 🗂 Estructura del Proyecto

```
frontend/
├── public/
│   └── logo.png                  ← Logo del parque (imagen circular)
│
├── src/
│   ├── main.tsx                  ← Punto de entrada — monta React en el DOM
│   ├── App.tsx                   ← Router principal + providers globales
│   ├── index.css                 ← Reset global de estilos
│   ├── style.css                 ← Estilos utilitarios adicionales
│   │
│   ├── assets/                   ← Recursos estáticos (imágenes, íconos)
│   │
│   ├── components/
│   │   └── AppLayout.tsx         ← Layout principal: sidebar, AppBar, Outlet
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx       ← Autenticación, sesión y permisos por rol
│   │   └── ThemeContext.tsx      ← Toggle modo claro / oscuro
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx         ← Pantalla de inicio de sesión
│   │   ├── DashboardPage.tsx     ← Panel de estadísticas generales
│   │   ├── AttractionsPage.tsx   ← CRUD de atracciones del parque
│   │   ├── DocumentationPage.tsx ← Planos por atracción
│   │   ├── PlanViewerPage.tsx    ← Visor PDF con anotaciones
│   │   ├── PlansManagementPage.tsx ← Gestión y subida de planos
│   │   ├── SearchPage.tsx        ← Búsqueda global de planos y componentes
│   │   └── UsersPage.tsx         ← Gestión de usuarios (solo admin)
│   │
│   ├── services/
│   │   └── api.ts                ← Capa de comunicación con el backend REST
│   │
│   ├── types/
│   │   └── index.ts              ← Tipos e interfaces TypeScript compartidos
│   │
│   ├── data/
│   │   └── mockData.ts           ← Datos de ejemplo para enriquecer respuestas
│   │
│   └── theme/                    ← Configuración del tema MUI (colores, tipografía)
│
├── index.html                    ← HTML base de la SPA
├── vite.config.ts                ← Configuración de Vite (proxy al backend)
├── tsconfig.json                 ← Configuración TypeScript
└── package.json
```

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz de `frontend/` (o `.env.local`):

```env
VITE_API_URL=http://127.0.0.1:4000/api
```

> Si no se define `VITE_API_URL`, la app usará `http://127.0.0.1:4000/api` por defecto (ver `src/services/api.ts`).

---

## 📦 Scripts NPM

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR (Hot Module Replacement) |
| `npm run build` | Compilación de producción a `dist/` |
| `npm run preview` | Vista previa del build de producción |

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env   # o crear manualmente (ver sección arriba)

# 3. Asegurarse de que el backend esté corriendo en puerto 4000
# (ver README del backend)

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

---

## 🔒 Roles y Permisos

| Rol | Email demo | Contraseña | Acceso |
|---|---|---|---|
| `admin` | admin@parquedelcafe.com | admin123 | Acceso total |
| `engineer` | ingeniero@parquedelcafe.com | ing123 | Crea/edita atracciones y planos |
| `technician` | tecnico@parquedelcafe.com | tec123 | Lectura + gestión de mantenimiento |
| `operator` | operador@parquedelcafe.com | op123 | Solo lectura |

Los permisos se definen en `src/contexts/AuthContext.tsx` en el objeto `rolePermissions`.

### Permisos disponibles

| Permiso | Descripción |
|---|---|
| `view_all` | Ver todas las secciones |
| `upload_plans` | Subir planos nuevos |
| `delete_plans` | Eliminar planos |
| `manage_users` | Gestionar usuarios |
| `manage_attractions` | Crear/editar/eliminar atracciones |
| `approve_plans` | Aprobar planos |
| `edit_specs` | Editar especificaciones técnicas |
| `add_comments` | Agregar comentarios |
| `view_maintenance` | Ver registros de mantenimiento |
| `manage_maintenance` | Gestionar mantenimiento |

---

## 🏗 Arquitectura

```
App.tsx (Router + Providers)
  │
  ├── AuthProvider       → Estado de sesión y permisos
  ├── ThemeProvider      → Modo claro/oscuro
  │
  ├── /login             → LoginPage (ruta pública)
  │
  └── / (ProtectedRoute) → AppLayout (sidebar + AppBar)
        ├── /dashboard
        ├── /attractions
        ├── /documentation/:id
        ├── /viewer/:planId
        ├── /plans         (requiere upload_plans)
        ├── /search
        └── /users         (requiere manage_users)
```

### Flujo de autenticación

```
LoginPage → api.login(email, password)
         → AuthContext.login() → guarda token y user en localStorage
         → Redirige a /dashboard
```

El token JWT se envía automáticamente en el header `Authorization: Bearer <token>` en todas las peticiones de `api.ts`.

---

## 🌐 Comunicación con el Backend

Toda la comunicación HTTP está centralizada en `src/services/api.ts`.

```typescript
import { api } from '../services/api';

// Ejemplos:
const attractions = await api.getAttractions();
const attraction  = await api.getAttraction('a1');
const newAttr     = await api.createAttraction(data, imageFile); // con imagen
await api.updateAttraction('a1', data, imageFile);               // actualizar imagen
await api.deleteAttraction('a1');
```

Las respuestas del backend siguen el formato `{ data: T }`. Los errores lanzan un `Error` con el mensaje del servidor.

---

## ➕ Cómo Agregar una Nueva Página

1. **Crear la página**: `src/pages/NuevaPagina.tsx`
2. **Importar en `App.tsx`** y agregar una `<Route>`
3. **Agregar al menú lateral** en `src/components/AppLayout.tsx` (array `navItems`)
4. **Agregar permiso** si la ruta debe estar restringida a ciertos roles:
   ```typescript
   { label: 'Mi Página', icon: <IconName />, path: '/mi-pagina', permission: 'mi_permiso' }
   ```
5. Registrar el permiso en `rolePermissions` dentro de `AuthContext.tsx`

---

## 🎨 Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | UI library |
| TypeScript | 5 | Tipado estático |
| Vite | 5 | Bundler + dev server |
| Material UI (MUI) | 5 | Componentes UI |
| React Router | 6 | Enrutamiento SPA |
| notistack | latest | Notificaciones toast |

---

## 📁 Relación con el Backend

El frontend consume la API REST del backend ubicado en `../backend`.

| Frontend | Backend |
|---|---|
| `src/types/index.ts` | `src/models/*.model.ts` |
| `src/services/api.ts` | `src/routes/*.routes.ts` |
| `AuthContext` roles | `src/middleware/auth.ts` |
| Imágenes: `attraction.image` | `uploads/` servido estáticamente |

> Para ejecutar el sistema completo, primero inicia el backend en el puerto 4000 y luego el frontend en el puerto 5173.
