# Tech Solutions — Frontend (Gestión de Proyectos)

Aplicación web de gestión de proyectos para la empresa ficticia **Tech Solutions**, desarrollada con fines académicos para el **Instituto Profesional IPSS** como parte de la **Evaluación Sumativa de la Unidad Nº 2** de la asignatura **Desarrollo de Software Web I — Sección 51**.

| | |
| :--- | :--- |
| **Desarrolladora** | Gina Norambuena Sánchez |
| **Docente** | Boris Belmar |
| **Asignatura** | Desarrollo de Software Web I — Sección 51 |
| **Institución** | Instituto Profesional IPSS |

Este repositorio contiene el **frontend**. El backend (NestJS + MySQL + Prisma) se encuentra en `back-tech-solutions-IPSS`.

---

## Tabla de contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Arquitectura](#arquitectura)
- [Justificación de tecnologías](#justificación-de-tecnologías)
- [Vistas](#vistas)

---

## Características

- Autenticación con **JWT**: registro e inicio de sesión de usuarios.
- **Dashboard de proyectos** protegido por token (CRUD completo).
- Validación de formularios **en tiempo real** (react-hook-form + zod).
- Protección de rutas por **middleware** (server-side) y por contexto de autenticación (client-side).
- Manejo centralizado de errores de la API con mensajes personalizados del backend.
- Interfaz responsiva y accesible construida con shadcn/ui sobre Tailwind CSS 4.
- Token gestionado en `localStorage` + cookie `auth_token` (para el middleware).

## Tecnologías

| Tecnología | Uso |
| :--- | :--- |
| **Next.js 15** (App Router) | Framework de React con enrutamiento por archivos y SSR/CSR |
| **React 19** + **TypeScript** | UI declarativa con tipado estático |
| **Tailwind CSS 4** | Estilos utilitarios con tokens de diseño |
| **shadcn/ui** | Componentes accesibles y reutilizables |
| **react-hook-form** | Gestión de formularios |
| **zod** | Esquemas de validación |
| **axios** | Cliente HTTP con interceptores |
| **sonner** | Notificaciones (toasts) |
| **lucide-react** | Iconografía |

## Requisitos

- **Node.js 20+** (Next.js 15 requiere Node 18.18.0 o superior).
- **Backend en ejecución** en `http://localhost:3000` (ver `back-tech-solutions-IPSS`).

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env.local (ver sección siguiente)

# 3. Levantar el servidor de desarrollo
npm run dev
```

La aplicación queda disponible en **`http://localhost:3001`**.

> **Nota:** si se cambia la variable de entorno `NEXT_PUBLIC_API_URL`, es necesario reiniciar el servidor de desarrollo (`rm -rf .next && npm run dev`).

### Comandos útiles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Compilación de producción |
| `npm run start` | Ejecutar build de producción |
| `npm run lint` | Análisis estático con ESLint |

## Variables de entorno

| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base del backend | `http://localhost:3000/api` |

## Arquitectura

```
src/
├── app/                          # Enrutamiento (App Router)
│   ├── (auth)/                   # Páginas públicas de autenticación
│   │   ├── layout.tsx            #   Layout de login/registro
│   │   ├── login/page.tsx        #   Inicio de sesión
│   │   └── registro/page.tsx     #   Registro de usuario
│   ├── proyectos/page.tsx        # Dashboard de proyectos (protegido)
│   ├── layout.tsx                # Layout raíz (AuthProvider + toasts)
│   ├── page.tsx                  # Redirige según el estado de sesión
│   └── globals.css               # Tokens de diseño (paleta corporativa)
├── components/
│   ├── modals/                   # Diálogos reutilizables
│   │   ├── confirm-dialog.tsx    #   Confirmación de acciones
│   │   └── proyecto-dialog.tsx   #   Formulario crear/editar proyecto
│   ├── tables/                   # Tablas reutilizables
│   │   └── proyectos-table.tsx   #   Listado con acciones por fila
│   └── ui/                       # Componentes base (shadcn/ui)
├── lib/
│   ├── http.ts                   # Cliente axios + interceptores (JWT, 401)
│   ├── auth-api.ts               # Peticiones a /auth (login, registro)
│   ├── projects.ts               # Peticiones a /proyectos (CRUD)
│   ├── auth.tsx                  # Contexto de autenticación (AuthProvider)
│   ├── auth-storage.ts           # Token: localStorage + cookie
│   ├── schemas.ts                # Esquemas de validación (zod)
│   ├── format.ts                 # Formato de fechas y moneda (es-CL)
│   └── utils.ts                  # Utilidades (cn)
└── middleware.ts                 # Protege /proyectos vía cookie JWT
```

### Flujo de autenticación

1. El usuario inicia sesión en `/login`; el backend valida las credenciales y retorna un **JWT**.
2. El token se guarda en `localStorage` y como cookie `auth_token` (`auth-storage.ts`).
3. El **middleware** (`middleware.ts`) valida la cookie en cada request a `/proyectos` y redirige a `/login` si no hay sesión.
4. En el cliente, el **AuthProvider** (`auth.tsx`) expone el estado de sesión y actualiza el UI.
5. Cada petición HTTP inyecta el token en el header `Authorization` mediante el interceptor de **axios** (`http.ts`).
6. Si el backend responde **401**, el interceptor limpia la sesión y redirige a `/login`.

### Flujo de datos

```
React (formulario) → zod (validación) → axios (API) → NestJS → Prisma → MySQL
```

## Justificación de tecnologías

- **Next.js 15:** Framework de React de uso estándar en la industria. Se eligió la **versión 15** porque, además de ser moderna (App Router, Server Components, Turbopack), es una versión **más estable y consolidada** que la 16, recién publicada, lo que garantiza mayor compatibilidad de ecosistema (middleware, shadcn/ui, Tailwind) y menor riesgo de cambios rupturistas para este proyecto académico.
- **TypeScript:** tipado estático que previene errores en tiempo de compilación y documenta el contrato de datos de la API (modelos `Project`, `User`, etc.).
- **Tailwind CSS 4:** desarrollo de estilos con clases utilitarias y un sistema de **tokens de diseño** (variables CSS en `oklch`) que permiten mantener una **identidad corporativa** consistente en toda la interfaz.
- **shadcn/ui:** componentes **accesibles, personalizables y reutilizables** basados en `@base-ui/react`. A diferencia de librerías cerradas, los componentes se copian al proyecto, por lo que pueden adaptarse a la paleta corporativa. Permite construir vistas **responsivas** (login, registro y dashboard) de forma rápida y consistente.
- **zod + react-hook-form:** validación de formularios **en tiempo real** con esquemas tipados que además se comparten con los tipos de TypeScript, reduciendo validaciones duplicadas y mejorando la experiencia de usuario.
- **axios:** cliente HTTP con **interceptores** que centralizan la inyección del token JWT y el manejo global de errores (401, mensajes del backend), evitando lógica repetida en cada petición.
- **sonner:** notificaciones no intrusivas para mostrar errores y confirmaciones de forma clara.

## Vistas

| Ruta | Descripción | Acceso |
| :--- | :--- | :--- |
| `/` | Redirige a `/proyectos` o `/login` según sesión | Público |
| `/login` | Inicio de sesión (retorna JWT) | Público |
| `/registro` | Registro de usuario (clave cifrada en backend) | Público |
| `/proyectos` | Dashboard de gestión de proyectos | **Protegido** (JWT) |

**Credenciales de prueba** (usuario sembrado en la BD):

```
Correo: demo@techsolutions.cl
Clave:  demo123456
```
