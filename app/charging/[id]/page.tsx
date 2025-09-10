// app/properties/[id]/page.tsx
export const dynamic = "force-dynamic";

import DetailPage from "@/app/component/DetailPage";
import { createSupabaseServer } from "@/app/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();

  if (error || !data) notFound();

  return <DetailPage data={data} />;
}
