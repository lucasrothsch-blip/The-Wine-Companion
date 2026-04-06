# The Wine Companion — Workboard iterativo

> Este archivo es la fuente de verdad para avanzar por iteraciones sin perder pendientes ni ideas.

## Cómo usar este checklist

- Cada ítem debe estar en uno de estos estados: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`.
- Cuando algo se complete, moverlo a `DONE` y dejar fecha breve.
- Las ideas nuevas van siempre a **Inbox de ideas** primero.
- Al inicio de cada iteración, seleccionar 3-5 tareas máximo desde `TODO`.

---

## Estado actual (2026-04-05)

- Objetivo activo: **vertical slice de Stock + Movimientos**.
- Stack actual: Next.js + Supabase + Tailwind.
- Base técnica ya creada: CRUD básicos, movimientos, dashboard y exports CSV.

---

## Checklist maestro

### 1) Producto / UX

- [ ] `TODO` Definir flujo demo principal (ingreso -> venta -> alerta de stock bajo visible).
- [ ] `TODO` Definir criterios de aceptación de demo por pantalla.
- [ ] `TODO` Unificar labels/copy en español (acentos, consistencia de términos).
- [ ] `TODO` Mejorar feedback de errores y estados de carga en formularios.

### 2) Dominio: Stock + Movimientos (foco actual)

- [x] `DONE` Permitir ajuste negativo/positivo de forma explícita (2026-04-05).
- [x] `DONE` Validar reglas por tipo (2026-04-05):
  - ingreso: `costo_unitario` requerido
  - venta: `precio_unitario` requerido
- [x] `DONE` Agregar motivo de ajuste obligatorio para auditoría (2026-04-05).
- [ ] `TODO` Mostrar stock antes/después en el historial de movimientos.
- [ ] `TODO` Manejar timezone de fecha de movimiento de forma consistente.

### 3) Datos / Supabase

- [ ] `TODO` Endurecer constraints SQL (rangos de precios/impuestos y checks de negocio).
- [ ] `TODO` Agregar vistas/materialized views para métricas del dashboard.
- [ ] `TODO` Revisar seed para cubrir casos reales (ventas múltiples y stock bajo).
- [ ] `TODO` Diseñar estrategia de migraciones incrementales por iteración.

### 4) API / Backend

- [ ] `TODO` Estandarizar respuestas de error (shape único para frontend).
- [ ] `TODO` Agregar paginación/filtros en listados grandes.
- [ ] `TODO` Agregar validación cruzada adicional servidor (ej: proveedor de vino activo).
- [ ] `TODO` Incorporar tests de integración para rutas críticas.

### 5) Frontend

- [ ] `TODO` Reemplazar tablas genéricas por tablas específicas por entidad.
- [ ] `TODO` Implementar edición/eliminación desde UI (hoy sólo alta/listado en pantallas principales).
- [ ] `TODO` Mejorar accesibilidad de formularios (labels, descripciones, errores por campo).
- [ ] `TODO` Agregar toasts de éxito/error.

### 6) Seguridad / Producción

- [ ] `TODO` Migrar desde `service role` a modelo con RLS + políticas por usuario.
- [ ] `TODO` Agregar autenticación y autorización por roles.
- [ ] `TODO` Registrar auditoría de acciones críticas.
- [ ] `TODO` Revisar exposición de endpoints de export.

### 7) Operación / Calidad

- [ ] `TODO` Definir estándar de DoD (Definition of Done) por tarea.
- [ ] `TODO` Activar CI con lint + typecheck + tests.
- [ ] `BLOCKED` Instalar dependencias en entorno actual (bloqueado por npm 403).
- [ ] `TODO` Agregar monitoreo de errores y logs de negocio.

---

## Próxima iteración propuesta (Iteración 1)

- [x] `DONE` Soportar ajuste negativo/positivo (2026-04-05).
- [x] `DONE` Reglas obligatorias por tipo (costo/precio) (2026-04-05).
- [x] `DONE` Mejorar errores por campo en formulario de movimientos (2026-04-05).
- [ ] `TODO` Criterio de aceptación de demo documentado.

---

## Inbox de ideas

- Reporte de margen por etiqueta/categoría.
- Alerta automática por email cuando stock < mínimo.
- Importador CSV (además de exportador).
- Registro de canales de venta con catálogo configurable.
- Historial de cambios por vino (price history).

---

## Decision log

- 2026-04-05: Se decide iterar primero sobre Stock + Movimientos para asegurar valor operativo temprano.
