// app/api/properties/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/app/supabase/server";

const toNull = (v: any) => (v === "" || v === undefined ? null : v);
const toNum = (v: any) => (v === "" || v === undefined ? null : Number(v));

export async function POST(req: Request) {
  const supabase = createSupabaseServer();

  try {
    const raw = await req.json();

    // ✅ user 관련 로직/변수 전부 제거 (author_id도 제거)
    const payload = {
      location: toNull(raw.location),
      area: toNum(raw.area),
      property_type: toNull(raw.property_type), // 'gas_station' | 'site' | ...
      floor: toNum(raw.floor),
      rooms_bathrooms: toNull(raw.rooms_bathrooms),
      approval_date: toNull(raw.approval_date), // 'YYYY-MM-DD' or null
      parking_spaces: toNum(raw.parking_spaces),
      deal_type: toNull(raw.deal_type), // '매매' | '임대'
      price: toNum(raw.price),
      pump_count: toNum(raw.pump_count),
      storage_tank: toNull(raw.storage_tank),
      sales_volume: toNum(raw.sales_volume),
      road_info: toNull(raw.road_info),
      pole: toNull(raw.pole),
      deposit: toNum(raw.deposit),
      monthly_rent: toNum(raw.monthly_rent),
      features: toNull(raw.features),
    };

    // undefined 필드 제거(부분 입력 안전)
    Object.keys(payload).forEach((k) => payload[k as keyof typeof payload] === undefined && delete payload[k as keyof typeof payload]);

    const { data, error } = await supabase.from("properties").insert(payload).select("id").single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/properties failed:", e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
