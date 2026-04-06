"use client";

import { useMemo, useState } from "react";

type Props<T extends Record<string, unknown>> = {
  rows: T[];
  title: string;
};

export function ClientTable<T extends Record<string, unknown>>({ rows, title }: Props<T>) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q.toLowerCase()));
  }, [rows, q]);

  if (rows.length === 0) return <p className="text-sm text-slate-600">Sin resultados.</p>;

  const columns = Object.keys(rows[0]);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." />
      </div>
      <div className="overflow-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 text-left font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-t">
                {columns.map((c) => (
                  <td key={c} className="px-3 py-2">
                    {String(row[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
