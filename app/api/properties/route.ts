// /app/api/properties/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/app/supabase/server";

// ?쒖슱 ??꾩〈 湲곗? YYYYMMDD ?꾨━?쎌뒪 ?앹꽦
function getKstYmd() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// ?쇰젴踰덊샇 ?앹꽦 (?? 20250910 + 01, 02 ...)
function buildCode(ymd: string, seq: number, padLen = 2) {
  return `${ymd}${String(seq).padStart(padLen, "0")}`;
}

export async function POST(req: Request) {
  const supabase = createSupabaseServer();

  try {
    const raw = await req.json();

    // ???뚯떛/?꾪꽣 ?꾨? ?쒓굅 ???ㅼ뼱??媛?洹몃?濡????
    const payload = {
      location: raw.location ?? null,
      property_type: raw.property_type ?? null,
      deal_type: raw.deal_type ?? null,

      // 硫댁쟻/?섎웾/湲덉븸: ?꾨? 臾몄옄??洹몃?濡?(DB 而щ읆? text/varchar 沅뚯옣)
      area: raw.area ?? null,
      land_area: raw.land_area ?? null,
      building_area: raw.building_area ?? null,
      price: raw.price ?? null,
      deposit: raw.deposit ?? null,
      monthly_rent: raw.monthly_rent ?? null,
      loan: raw.loan ?? null,
      facility_premium: raw.facility_premium ?? null,
      pump_count: raw.pump_count ?? null,
      storage_tank: raw.storage_tank ?? null,
      sales_volume: raw.sales_volume ?? null,

      // 湲고? ?띿뒪??
      floor: raw.floor ?? null,
      rooms_bathrooms: raw.rooms_bathrooms ?? null,
      approval_date: raw.approval_date ?? null,
      parking_spaces: raw.parking_spaces ?? null,
      road_info: raw.road_info ?? null,
      pole: raw.pole ?? null,
      features: raw.features ?? null,

      // ?뚮옒洹?(boolean 罹먯뒪?낅쭔)
      is_recommended: Boolean(raw.is_recommended),
      is_urgent: Boolean(raw.is_urgent),
    };

    // ?ㅻ뒛 ?좎쭨 ?꾨━?쎌뒪(YYYYMMDD)
    const ymd = getKstYmd();

    // ?ㅻ뒛 諛쒓툒??肄붾뱶 媛쒖닔 ?뺤씤 ???ㅼ쓬 ?쒗??踰덊샇
    const { count, error: countErr } = await supabase.from("properties").select("code", { count: "exact", head: true }).ilike("code", `${ymd}%`);

    if (countErr) {
      console.error("Count error:", countErr);
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }

    let seq = (count ?? 0) + 1;
    const MAX_RETRY = 5;
    let lastError: any = null;

    // ?숈떆???鍮? ?좊땲??異⑸룎 ???ъ떆??
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      const tempCode = buildCode(ymd, seq, 2);

      const { data, error } = await supabase
        .from("properties")
        .insert({ ...payload, code: tempCode })
        .select("id")
        .single();

      if (!error) {
        // ?깃났: id 湲곗? 6?먰옄 0 padding ?곸슜
        const finalCode = String(data!.id).padStart(6, "0");
        const { error: updateError } = await supabase.from("properties").update({ code: finalCode }).eq("id", data!.id);
        if (updateError) {
          console.error("Code update error:", updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        return NextResponse.json({ id: data!.id, code: finalCode }, { status: 201 });
      }

      // ?좊땲?ы궎 異⑸룎(23505): 踰덊샇 ?щ━怨??ъ떆??
      if ((error as any)?.code === "23505") {
        seq += 1;
        lastError = error;
        continue;
      }

      // 湲고? ?먮윭??利됱떆 諛섑솚
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ?ъ떆??紐⑤몢 ?ㅽ뙣
    console.error("Insert conflict after retries:", lastError);
    return NextResponse.json({ error: "肄붾뱶 諛쒓툒 異⑸룎濡??깅줉 ?ㅽ뙣. ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂." }, { status: 409 });
  } catch (e: any) {
    console.error("POST /api/properties failed:", e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}