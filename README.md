# The Wine Companion (MVP)

MVP en **Next.js + Supabase + Tailwind** para gestión de vinos, proveedores, stock, dashboard y exportación CSV.

## Features implementadas

- CRUD de **vinos**.
- CRUD de **proveedores**.
- Registro de **movimientos de stock** (ingreso/venta/ajuste).
- Actualización automática de `stock_actual` por función SQL (`record_stock_movement`).
- Bloqueo de stock negativo por defecto (`bloquear_stock_negativo = true`).
- Dashboard con filtros por fecha:
  - valor total de stock (costo)
  - total vendido
  - total comprado
  - margen bruto estimado
  - alertas de stock bajo
  - top 10 vinos vendidos
- Export CSV:
  - `/api/export/wines`
  - `/api/export/movements`

## Requisitos

- Node.js 20+
- Proyecto Supabase (cloud o local con Supabase CLI)

## Setup local

1. Instalar dependencias:

```bash
npm install
```

2. Copiar variables de entorno:

```bash
cp .env.example .env.local
```

3. Completar en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Ejecutar migraciones y seed en Supabase SQL Editor (o con CLI):

- `supabase/migrations/202604050001_init.sql`
- `supabase/migrations/202604050002_stock_movement_rules.sql`
- `supabase/seed.sql`

5. Levantar app:

```bash
npm run dev
```

Abrir: `http://localhost:3000`


## Gestión iterativa

- Checklist maestro y backlog vivo: `docs/WORKBOARD.md`.

## Endpoints API

- Vinos: `GET/POST /api/wines`, `GET/PUT/DELETE /api/wines/:id`
- Proveedores: `GET/POST /api/providers`, `GET/PUT/DELETE /api/providers/:id`
- Movimientos: `GET/POST /api/movements`
- Dashboard: `GET /api/dashboard?from=...&to=...`
- CSV: `GET /api/export/wines`, `GET /api/export/movements`

## Validaciones

Validaciones con Zod en frontend y backend:

- `lib/validations.ts`

## Notas MVP

- En este MVP se usa `SUPABASE_SERVICE_ROLE_KEY` en rutas del servidor para simplificar permisos.
- Para producción: activar RLS, separar roles y auditar permisos por usuario.


## Dónde probar el primer bloque funcional

Para validar el bloque de **Stock + Movimientos**:

1. UI ficha de vino: `http://localhost:3000/wines/:id`
   - validar información completa del vino (datos, costos, stock y estado)
   - validar historial de movimientos del vino
2. UI movimientos: `http://localhost:3000/movements`
   - probar `ingreso` sin `costo_unitario` (debe mostrar error por campo)
   - probar `venta` sin `precio_unitario` (debe mostrar error por campo)
   - probar `ajuste` sin `notas` (debe mostrar error por campo)
   - probar `ajuste` con `ajuste_modo = decremento` para verificar rebaja de stock
3. Dashboard: `http://localhost:3000`
   - verificar impacto en métricas y alertas luego de movimientos
4. API directa (opcional): `POST /api/movements`
   - confirmar `fieldErrors` en respuestas 400 y control de stock negativo
