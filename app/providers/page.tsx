"use client";

import { FormEvent, useEffect, useState } from "react";
import { providerSchema } from "@/lib/validations";
import { ClientTable } from "@/app/components/ClientTable";

const initial = {
  nombre: "",
  contacto_nombre: "",
  contacto_email: "",
  contacto_tel: "",
  condicion_pago_dias: 30,
  datos_facturacion: "",
  observaciones: ""
};

export default function ProvidersPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const load = async () => setRows(await (await fetch("/api/providers")).json());
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = providerSchema.safeParse(form);
    if (!parsed.success) return setError("Revisá los campos del formulario.");
    const res = await fetch("/api/providers", {
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
      <h1 className="text-2xl font-bold">Proveedores</h1>
      <form className="grid gap-2 rounded-lg border bg-white p-4 md:grid-cols-3" onSubmit={submit}>
        {Object.entries(form).map(([k, v]) => (
          <label className="flex flex-col gap-1 text-sm" key={k}>
            {k}
            <input
              type={typeof v === "number" ? "number" : "text"}
              value={String(v)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  [k]: typeof v === "number" ? Number(e.target.value) : e.target.value
                }))
              }
            />
          </label>
        ))}
        <button className="bg-slate-900 text-white md:col-span-3">Guardar proveedor</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ClientTable rows={rows} title="Listado de proveedores" />
    </section>
  );
}
