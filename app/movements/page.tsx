"use client";

import { FormEvent, useEffect, useState } from "react";
import { movementSchema } from "@/lib/validations";
import { ClientTable } from "@/app/components/ClientTable";

const nowIso = () => new Date().toISOString();

type FieldErrors = Record<string, string[]>;

const initial = {
  tipo: "ingreso",
  fecha: nowIso(),
  wine_id: "",
  cantidad: 1,
  costo_unitario: 0,
  precio_unitario: 0,
  proveedor_id: "",
  canal: "tienda",
  notas: "",
  bloquear_stock_negativo: true,
  ajuste_modo: "incremento"
};

export default function MovementsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [wines, setWines] = useState<{ id: string; nombre: string }[]>([]);
  const [providers, setProviders] = useState<{ id: string; nombre: string }[]>([]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const load = async () => {
    const [m, w, p] = await Promise.all([
      fetch("/api/movements").then((r) => r.json()),
      fetch("/api/wines").then((r) => r.json()),
      fetch("/api/providers").then((r) => r.json())
    ]);
    setRows(m);
    setWines(w.map((x: { id: string; nombre: string }) => ({ id: x.id, nombre: x.nombre })));
    setProviders(p.map((x: { id: string; nombre: string }) => ({ id: x.id, nombre: x.nombre })));
  };

  useEffect(() => {
    load();
  }, []);

  const getFieldError = (name: string) => fieldErrors[name]?.[0];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      proveedor_id: form.proveedor_id || null,
      costo_unitario: Number(form.costo_unitario) || null,
      precio_unitario: Number(form.precio_unitario) || null,
      notas: form.notas || null
    };

    const parsed = movementSchema.safeParse(payload);
    if (!parsed.success) {
      setError("Hay errores de validación.");
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data)
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "No se pudo registrar movimiento");
      setFieldErrors(body.fieldErrors || {});
      return;
    }

    setForm({ ...initial, fecha: nowIso() });
    setError("");
    setFieldErrors({});
    load();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimientos de stock</h1>
        <a className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" href="/api/export/movements">
          Exportar CSV
        </a>
      </div>
      <form className="grid gap-2 rounded-lg border bg-white p-4 md:grid-cols-4" onSubmit={submit}>
        <FieldError error={getFieldError("tipo")}>
          <label className="flex flex-col gap-1 text-sm">
            tipo
            <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}>
              <option value="ingreso">ingreso</option>
              <option value="venta">venta</option>
              <option value="ajuste">ajuste</option>
            </select>
          </label>
        </FieldError>

        {form.tipo === "ajuste" && (
          <label className="flex flex-col gap-1 text-sm">
            ajuste_modo
            <select value={form.ajuste_modo} onChange={(e) => setForm((p) => ({ ...p, ajuste_modo: e.target.value }))}>
              <option value="incremento">incremento (+)</option>
              <option value="decremento">decremento (-)</option>
            </select>
          </label>
        )}

        <FieldError error={getFieldError("fecha")}>
          <label className="flex flex-col gap-1 text-sm">
            fecha
            <input value={form.fecha} onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} />
          </label>
        </FieldError>

        <FieldError error={getFieldError("wine_id")}>
          <label className="flex flex-col gap-1 text-sm">
            wine_id
            <select value={form.wine_id} onChange={(e) => setForm((p) => ({ ...p, wine_id: e.target.value }))}>
              <option value="">Seleccionar</option>
              {wines.map((w) => (
                <option value={w.id} key={w.id}>
                  {w.nombre}
                </option>
              ))}
            </select>
          </label>
        </FieldError>

        <label className="flex flex-col gap-1 text-sm">
          proveedor_id
          <select value={form.proveedor_id} onChange={(e) => setForm((p) => ({ ...p, proveedor_id: e.target.value }))}>
            <option value="">Sin proveedor</option>
            {providers.map((p) => (
              <option value={p.id} key={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>

        <FieldError error={getFieldError("cantidad")}>
          <label className="flex flex-col gap-1 text-sm">
            cantidad
            <input
              type="number"
              value={form.cantidad}
              onChange={(e) => setForm((prev) => ({ ...prev, cantidad: Number(e.target.value) }))}
            />
          </label>
        </FieldError>

        <FieldError error={getFieldError("costo_unitario")}>
          <label className="flex flex-col gap-1 text-sm">
            costo_unitario
            <input
              type="number"
              value={form.costo_unitario}
              onChange={(e) => setForm((prev) => ({ ...prev, costo_unitario: Number(e.target.value) }))}
            />
          </label>
        </FieldError>

        <FieldError error={getFieldError("precio_unitario")}>
          <label className="flex flex-col gap-1 text-sm">
            precio_unitario
            <input
              type="number"
              value={form.precio_unitario}
              onChange={(e) => setForm((prev) => ({ ...prev, precio_unitario: Number(e.target.value) }))}
            />
          </label>
        </FieldError>

        <label className="flex flex-col gap-1 text-sm">
          canal
          <input value={form.canal} onChange={(e) => setForm((prev) => ({ ...prev, canal: e.target.value }))} />
        </label>

        <FieldError error={getFieldError("notas")}>
          <label className="flex flex-col gap-1 text-sm md:col-span-4">
            notas / motivo
            <input value={form.notas} onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))} />
          </label>
        </FieldError>

        <label className="flex items-center gap-2 text-sm md:col-span-4">
          <input
            type="checkbox"
            checked={form.bloquear_stock_negativo}
            onChange={(e) => setForm((p) => ({ ...p, bloquear_stock_negativo: e.target.checked }))}
          />
          bloquear_stock_negativo
        </label>
        <button className="bg-slate-900 text-white md:col-span-4">Registrar movimiento</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ClientTable rows={rows} title="Historial de movimientos" />
    </section>
  );
}

function FieldError({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
