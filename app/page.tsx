"use client";

import { useEffect, useState } from "react";

type Dashboard = {
  valorTotalStock: number;
  totalVendido: number;
  totalComprado: number;
  margenBrutoEstimado: number;
  alertasStockBajo: { id: string; nombre: string; stock_actual: number; stock_minimo_alerta: number }[];
  top10VinosVendidos: { wine_id: string; nombre: string; cantidad: number }[];
};

const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n || 0);

export default function DashboardPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);

  const load = async () => {
    const params = new URLSearchParams();
    if (from) params.set("from", `${from}T00:00:00Z`);
    if (to) params.set("to", `${to}T23:59:59Z`);
    const res = await fetch(`/api/dashboard?${params.toString()}`);
    setData(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex gap-2">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="bg-slate-900 text-white" onClick={load}>
          Filtrar
        </button>
      </div>

      {data && (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <Card label="Valor total stock" value={fmt(data.valorTotalStock)} />
            <Card label="Total vendido" value={fmt(data.totalVendido)} />
            <Card label="Total comprado" value={fmt(data.totalComprado)} />
            <Card label="Margen bruto estimado" value={fmt(data.margenBrutoEstimado)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <h2 className="font-semibold">Alertas stock bajo</h2>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {data.alertasStockBajo.map((w) => (
                  <li key={w.id}>
                    {w.nombre}: {w.stock_actual} (mínimo {w.stock_minimo_alerta})
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h2 className="font-semibold">Top 10 vinos vendidos</h2>
              <ol className="mt-2 list-decimal pl-5 text-sm">
                {data.top10VinosVendidos.map((w) => (
                  <li key={w.wine_id}>
                    {w.nombre}: {w.cantidad}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </article>
  );
}
