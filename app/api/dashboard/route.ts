import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const supabase = getServiceClient();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "1900-01-01";
  const to = searchParams.get("to") ?? "2999-12-31";

  const [stockValueQ, soldQ, purchasedQ, winesQ, topSalesQ] = await Promise.all([
    supabase.from("wines").select("stock_actual, costo_con_iva"),
    supabase
      .from("stock_movements")
      .select("cantidad, precio_unitario")
      .eq("tipo", "venta")
      .gte("fecha", from)
      .lte("fecha", to),
    supabase
      .from("stock_movements")
      .select("cantidad, costo_unitario")
      .eq("tipo", "ingreso")
      .gte("fecha", from)
      .lte("fecha", to),
    supabase.from("wines").select("id, nombre, stock_actual, stock_minimo_alerta"),
    supabase
      .from("stock_movements")
      .select("wine_id, cantidad, wines(nombre)")
      .eq("tipo", "venta")
      .gte("fecha", from)
      .lte("fecha", to)
  ]);

  const errors = [stockValueQ.error, soldQ.error, purchasedQ.error, winesQ.error, topSalesQ.error].filter(Boolean);
  if (errors.length > 0) return NextResponse.json({ error: errors[0]?.message }, { status: 400 });

  const valorTotalStock = (stockValueQ.data ?? []).reduce((acc, row) => acc + row.stock_actual * Number(row.costo_con_iva), 0);
  const totalVendido = (soldQ.data ?? []).reduce((acc, row) => acc + row.cantidad * Number(row.precio_unitario ?? 0), 0);
  const totalComprado = (purchasedQ.data ?? []).reduce((acc, row) => acc + row.cantidad * Number(row.costo_unitario ?? 0), 0);
  const margenBrutoEstimado = totalVendido - totalComprado;
  const alertasStockBajo = (winesQ.data ?? []).filter((w) => w.stock_actual <= w.stock_minimo_alerta);

  const grouped = new Map<string, { wine_id: string; nombre: string; cantidad: number }>();
  (topSalesQ.data ?? []).forEach((row) => {
    const prev = grouped.get(row.wine_id) ?? {
      wine_id: row.wine_id,
      nombre: (row.wines as { nombre?: string } | null)?.nombre ?? "Sin nombre",
      cantidad: 0
    };
    prev.cantidad += row.cantidad;
    grouped.set(row.wine_id, prev);
  });

  const top10 = [...grouped.values()].sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);

  return NextResponse.json({
    valorTotalStock,
    totalVendido,
    totalComprado,
    margenBrutoEstimado,
    alertasStockBajo,
    top10VinosVendidos: top10
  });
}
