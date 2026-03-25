# EPR Reservas Platform

Plataforma multi-tenant de reservas de eventos y paquetes construida con Next.js App Router, Supabase y TypeScript estricto.

## Stack

- Next.js App Router + TypeScript strict
- Tailwind CSS + componentes UI reutilizables
- Supabase Auth + Postgres + RLS
- Zod + React Hook Form
- TanStack Table para panel admin
- Upstash Redis para rate limit

## Desarrollo local

1. Instala dependencias:

```bash
npm install
```

2. Copia variables de entorno:

```bash
cp .env.example .env.local
```

3. Ejecuta el proyecto:

```bash
npm run dev
```

## Estructura base

```text
src/
  app/
  components/
  features/
  lib/
supabase/
  migrations/
  seed/
```

## Migracion inicial

La migracion inicial de Supabase esta en:

- `supabase/migrations/202603240001_initial_schema.sql`

Incluye:
- tablas multi-tenant con `organization_id`
- enums de dominio
- indices y triggers `updated_at`
- RLS por organizacion y rol
- funciones RPC para reservas, pago, expiracion y check-in
