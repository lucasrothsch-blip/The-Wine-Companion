"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { wineSchema } from "@/lib/validations";
import { ClientTable } from "@/app/components/ClientTable";

const initial = {
  nombre: "",
  categoria: "Tinto",
  cepa: "",
  pais: "",
  region: "",
  bodega: "",
  anada: new Date().getFullYear(),
  proveedor_id: "",
  costo_sin_iva: 0,
  alicuota_iva: 21,
  costo_con_iva: 0,
  precio_venta: 0,
  stock_actual: 0,
  stock_minimo_alerta: 3,
  activo: true
};

export default function WinesPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const load = async () => setRows(await (await fetch("/api/wines")).json());
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = wineSchema.safeParse({ ...form, proveedor_id: form.proveedor_id || null });
    if (!parsed.success) return setError("Revisá los campos del formulario.");
    const res = await fetch("/api/wines", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data)
    });
    if (!res.ok) return setError("No se pudo guardar.");
    setForm(initial);
    setError("");
    load();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vinos</h1>
        <a className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" href="/api/export/wines">
          Exportar CSV
        </a>
      </div>
      <form className="grid gap-2 rounded-lg border bg-white p-4 md:grid-cols-4" onSubmit={submit}>
        {Object.entries(form).map(([k, v]) => (
          <label className="flex flex-col gap-1 text-sm" key={k}>
            {k}
            <input
              type={typeof v === "number" ? "number" : typeof v === "boolean" ? "checkbox" : "text"}
              checked={typeof v === "boolean" ? v : undefined}
              value={typeof v !== "boolean" ? String(v) : undefined}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  [k]: typeof v === "number" ? Number(e.target.value) : typeof v === "boolean" ? e.target.checked : e.target.value
                }))
              }
            />
          </label>
        ))}
        <button className="bg-slate-900 text-white md:col-span-4">Guardar vino</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <article className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Fichas rápidas</h2>
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li className="flex items-center justify-between rounded border border-slate-200 px-3 py-2" key={String(row.id)}>
              <span>
                <strong>{String(row.nombre)}</strong> · {String(row.cepa)} · stock {String(row.stock_actual)}
              </span>
              <Link className="text-blue-700 underline" href={`/wines/${row.id}`}>
                Ver ficha
              </Link>
            </li>
          ))}
        </ul>
      </article>
      <ClientTable rows={rows} title="Listado de vinos" />
    </section>
  );
}
