# EPR Reservas

Aplicación web corporativa para la gestión de **reservas de eventos y paquetes** (catálogo público, proceso de compra, área de cliente y panel administrativo). Proyecto **privado** de **EPR S.A.**; este documento resume lo necesario para desarrollo y despliegue, sin detallar lógica de negocio interna ni credenciales.

---

## Alcance funcional (resumen)

| Ámbito | Contenido |
|--------|-----------|
| Sitio público | Eventos, paquetes, carrito, checkout y confirmaciones según flujo configurado |
| Cliente | Cuenta, reservas y tickets digitales |
| Administración | Catálogo, reservas, control de acceso (check-in) y métricas operativas |

Los detalles de reglas comerciales, políticas y configuración por entorno se documentan **fuera** de este repositorio cuando aplique.

---

## Stack técnico

- **Framework:** Next.js (App Router), React, TypeScript  
- **Estilos:** Tailwind CSS  
- **Datos y auth:** Supabase (PostgreSQL, RLS, autenticación)  
- **Validación:** Zod (y formularios con React Hook Form donde corresponda)  
- **Panel de tablas:** TanStack Table  
- **Otros:** integraciones opcionales según variables de entorno (p. ej. correo transaccional, analítica, observabilidad); ver `.env.example`

---

## Requisitos

- **Node.js** (LTS recomendado)  
- **npm** (gestor usado en el proyecto)

---

## Puesta en marcha local

```bash
npm install
cp .env.example .env.local
```

Complete `.env.local` con los valores que el equipo le facilite (URLs de Supabase, claves y parámetros de integración). **No** suba `.env.local` al repositorio.

```bash
npm run dev
```

La aplicación queda disponible en la URL que indique la consola (por defecto `http://localhost:3000` si `NEXT_PUBLIC_APP_URL` apunta a local).

---

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor tras `build` |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobación de tipos TypeScript |

---

## Estructura del código (orientativa)

```text
src/
  app/           # Rutas y layouts (App Router)
  components/    # UI compartida
  features/      # Módulos por dominio (eventos, admin, check-in, etc.)
  lib/           # Utilidades, cliente Supabase, validaciones
supabase/
  migrations/    # Esquema y cambios de base de datos
```

---

## Base de datos

Las migraciones SQL viven en `supabase/migrations/`. El orden y la aplicación en cada entorno (desarrollo, staging, producción) las coordina el equipo; no se incluyen datos reales en el repositorio.

---

## Variables de entorno

Los nombres de variables esperados están en **`.env.example`**. Cada clave y valor debe obtenerse por canales internos; este README no documenta secretos ni endpoints privados.

---

## Licencia y uso

Código **privado** y de uso restringido a **EPR S.A.** y personas autorizadas. Queda prohibida la redistribución o el uso fuera del ámbito acordado sin permiso expreso.

---

*Última actualización del README orientada a onboarding técnico; para cambios de producto o operativa, consultar la documentación interna de la empresa.*
