"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Wine = {
  id: string;
  nombre: string;
  categoria: string;
  cepa: string;
  pais: string;
  region: string;
  bodega: string;
  anada: number;
  proveedor_id: string | null;
  costo_sin_iva: number;
  alicuota_iva: number;
  costo_con_iva: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo_alerta: number;
  activo: boolean;
};

type Provider = { id: string; nombre: string };
type Movement = {
  id: string;
  tipo: "ingreso" | "venta" | "ajuste";
  fecha: string;
  wine_id: string;
  cantidad: number;
  costo_unitario: number | null;
  precio_unitario: number | null;
  canal: string | null;
  notas: string | null;
};

const currency = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(n || 0));

export default function WineDetailPage({ params }: { params: { id: string } }) {
  const [wine, setWine] = useState<Wine | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const [wRes, pRes, mRes] = await Promise.all([
        fetch(`/api/wines/${params.id}`),
        fetch("/api/providers"),
        fetch("/api/movements")
      ]);

      if (!wRes.ok) {
        setError("No se encontró el vino solicitado.");
        return;
      }

      const [wineData, providersData, movementData] = await Promise.all([wRes.json(), pRes.json(), mRes.json()]);
      setWine(wineData);
      setProviders(providersData);
      setMovements((movementData || []).filter((m: Movement) => m.wine_id === params.id));
    };

    load();
  }, [params.id]);

  const proveedorNombre = useMemo(
    () => providers.find((p) => p.id === wine?.proveedor_id)?.nombre || "Sin proveedor",
    [providers, wine?.proveedor_id]
  );

  if (error) {
    return (
      <section className="space-y-4">
        <Link href="/wines" className="text-sm text-blue-700 underline">
          ← Volver a vinos
        </Link>
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      </section>
    );
  }

  if (!wine) return <p className="text-sm text-slate-600">Cargando ficha del vino...</p>;

  const valorStock = wine.stock_actual * Number(wine.costo_con_iva);
  const margenUnitario = Number(wine.precio_venta) - Number(wine.costo_con_iva);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/wines" className="text-sm text-blue-700 underline">
            ← Volver a vinos
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{wine.nombre}</h1>
          <p className="text-sm text-slate-600">
            {wine.categoria} · {wine.cepa} · {wine.pais}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${wine.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
          {wine.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card label="Stock actual" value={String(wine.stock_actual)} />
        <Card label="Stock mínimo alerta" value={String(wine.stock_minimo_alerta)} />
        <Card label="Valor stock (costo)" value={currency(valorStock)} />
        <Card label="Margen unitario estimado" value={currency(margenUnitario)} />
      </div>

      <article className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Información general</h2>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <Field label="Bodega" value={wine.bodega} />
          <Field label="Región" value={wine.region} />
          <Field label="Añada" value={String(wine.anada)} />
          <Field label="Proveedor" value={proveedorNombre} />
          <Field label="Costo sin IVA" value={currency(wine.costo_sin_iva)} />
          <Field label="Alícuota IVA" value={`${wine.alicuota_iva}%`} />
          <Field label="Costo con IVA" value={currency(wine.costo_con_iva)} />
          <Field label="Precio de venta" value={currency(wine.precio_venta)} />
        </dl>
      </article>

      <article className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Historial de movimientos</h2>
        {movements.length === 0 ? (
          <p className="text-sm text-slate-600">Este vino todavía no tiene movimientos registrados.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Cantidad</th>
                  <th className="px-3 py-2 text-left">Costo unitario</th>
                  <th className="px-3 py-2 text-left">Precio unitario</th>
                  <th className="px-3 py-2 text-left">Canal</th>
                  <th className="px-3 py-2 text-left">Notas</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-3 py-2">{new Date(m.fecha).toLocaleString("es-AR")}</td>
                    <td className="px-3 py-2">{m.tipo}</td>
                    <td className="px-3 py-2">{m.cantidad}</td>
                    <td className="px-3 py-2">{m.costo_unitario == null ? "-" : currency(m.costo_unitario)}</td>
                    <td className="px-3 py-2">{m.precio_unitario == null ? "-" : currency(m.precio_unitario)}</td>
                    <td className="px-3 py-2">{m.canal || "-"}</td>
                    <td className="px-3 py-2">{m.notas || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-2">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
