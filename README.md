# Frontend - Tech Solutions (Gestión de Proyectos)

Frontend desarrollado con **Next.js 15**, **Tailwind CSS 4** y **shadcn/ui**.

## Requisitos

- Node.js 20+
- Backend en ejecución (ver `back-tech-solutions-IPSS`)

## Instalación

```bash
npm install
```

## Configuración

Crear el archivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Ejecución

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3001`.

## Vistas

- `/` → Redirige según autenticación
- `/login` → Inicio de sesión (retorna JWT)
- `/registro` → Registro de usuario (clave cifrada en el backend)
- `/proyectos` → Dashboard de gestión de proyectos (protegido por JWT)

El token JWT se almacena en `localStorage` y se envía en el header `Authorization` en cada solicitud a la API.