import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { providerSchema } from "@/lib/validations";

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("providers").select("*").order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const parsed = providerSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = getServiceClient();
  const { data, error } = await supabase.from("providers").insert(parsed.data).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
