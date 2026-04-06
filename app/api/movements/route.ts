import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { movementSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const supabase = getServiceClient();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("stock_movements")
    .select("*, wines(nombre), providers(nombre)")
    .order("fecha", { ascending: false });

  if (from) query = query.gte("fecha", from);
  if (to) query = query.lte("fecha", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const parsed = movementSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Errores de validación",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("record_stock_movement", parsed.data);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
