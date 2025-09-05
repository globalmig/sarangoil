// app/api/properties/[id]/route.ts  (GET 단건, PATCH 수정, DELETE 삭제)
import { createSupabaseServer } from "@/app/supabase/server";
import { NextResponse } from "next/server";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("properties").select("*").eq("id", Number(params.id)).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: Request, { params }: Params) {
  const supabase = createSupabaseServer();

  const payload = await req.json();

  const { error } = await supabase.from("properties").update(payload).eq("id", Number(params.id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createSupabaseServer();

  const { error } = await supabase.from("properties").delete().eq("id", Number(params.id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
