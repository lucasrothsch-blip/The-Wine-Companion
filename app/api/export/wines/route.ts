import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("wines").select("*").order("nombre");
  if (error) return new Response(error.message, { status: 400 });

  const headers = Object.keys(data?.[0] ?? {});
  const rows = [headers.join(",")]
    .concat((data ?? []).map((row) => headers.map((h) => JSON.stringify(row[h as keyof typeof row] ?? "")).join(",")))
    .join("\n");

  return new Response(rows, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="wines.csv"'
    }
  });
}
