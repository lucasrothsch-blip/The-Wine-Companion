import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { providerSchema } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("providers").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const parsed = providerSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("providers")
    .update(parsed.data)
    .eq("id", params.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("providers").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
