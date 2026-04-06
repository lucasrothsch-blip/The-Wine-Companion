import { z } from "zod";

const currency = z.coerce.number().finite().nonnegative();

export const wineSchema = z.object({
  nombre: z.string().min(2),
  categoria: z.string().min(2),
  cepa: z.string().min(2),
  pais: z.string().min(2),
  region: z.string().min(2),
  bodega: z.string().min(2),
  anada: z.coerce.number().int().min(1900).max(2100),
  proveedor_id: z.string().uuid().nullable().optional(),
  costo_sin_iva: currency,
  alicuota_iva: z.coerce.number().min(0).max(100),
  costo_con_iva: currency,
  precio_venta: currency,
  stock_actual: z.coerce.number().int().min(0),
  stock_minimo_alerta: z.coerce.number().int().min(0),
  activo: z.coerce.boolean()
});

export const providerSchema = z.object({
  nombre: z.string().min(2),
  contacto_nombre: z.string().min(2),
  contacto_email: z.string().email(),
  contacto_tel: z.string().min(5),
  condicion_pago_dias: z.coerce.number().int().min(0),
  datos_facturacion: z.string().min(2),
  observaciones: z.string().optional().default("")
});

export const movementSchema = z
  .object({
    tipo: z.enum(["ingreso", "venta", "ajuste"]),
    fecha: z.string().datetime({ offset: true }),
    wine_id: z.string().uuid(),
    cantidad: z.coerce.number().int().positive(),
    costo_unitario: currency.optional().nullable(),
    precio_unitario: currency.optional().nullable(),
    proveedor_id: z.string().uuid().optional().nullable(),
    canal: z.string().optional().nullable(),
    notas: z.string().optional().nullable(),
    bloquear_stock_negativo: z.coerce.boolean().optional().default(true),
    ajuste_modo: z.enum(["incremento", "decremento"]).optional().default("incremento")
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "ingreso" && data.costo_unitario == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["costo_unitario"],
        message: "Para un ingreso, costo_unitario es obligatorio"
      });
    }

    if (data.tipo === "venta" && data.precio_unitario == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["precio_unitario"],
        message: "Para una venta, precio_unitario es obligatorio"
      });
    }

    if (data.tipo === "ajuste" && (!data.notas || data.notas.trim().length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["notas"],
        message: "Para un ajuste, notas/motivo es obligatorio"
      });
    }
  });
