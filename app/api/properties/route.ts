// /app/api/properties/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/app/supabase/server";

// 서울 타임존 기준 YYYYMMDD 프리픽스 생성
function getKstYmd() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// 일련번호 생성 (예: 20250910 + 01, 02 ...)
function buildCode(ymd: string, seq: number, padLen = 2) {
  return `${ymd}${String(seq).padStart(padLen, "0")}`;
}

export async function POST(req: Request) {
  const supabase = createSupabaseServer();

  try {
    const raw = await req.json();

    // ✅ 파싱/필터 전부 제거 — 들어온 값 그대로 저장
    const payload = {
      location: raw.location ?? null,
      property_type: raw.property_type ?? null,
      deal_type: raw.deal_type ?? null,

      // 면적/수량/금액: 전부 문자열 그대로 (DB 컬럼은 text/varchar 권장)
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

      // 기타 텍스트
      floor: raw.floor ?? null,
      rooms_bathrooms: raw.rooms_bathrooms ?? null,
      approval_date: raw.approval_date ?? null,
      parking_spaces: raw.parking_spaces ?? null,
      road_info: raw.road_info ?? null,
      pole: raw.pole ?? null,
      features: raw.features ?? null,

      // 플래그 (boolean 캐스팅만)
      is_recommended: Boolean(raw.is_recommended),
      is_urgent: Boolean(raw.is_urgent),
    };

    // 오늘 날짜 프리픽스(YYYYMMDD)
    const ymd = getKstYmd();

    // 오늘 발급된 코드 개수 확인 → 다음 시퀀스 번호
    const { count, error: countErr } = await supabase.from("properties").select("code", { count: "exact", head: true }).ilike("code", `${ymd}%`);

    if (countErr) {
      console.error("Count error:", countErr);
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }

    let seq = (count ?? 0) + 1;
    const MAX_RETRY = 5;
    let lastError: any = null;

    // 동시성 대비: 유니크 충돌 시 재시도
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      const code = buildCode(ymd, seq, 2);

      const { data, error } = await supabase
        .from("properties")
        .insert({ ...payload, code })
        .select("id, code")
        .single();

      if (!error) {
        // 성공
        return NextResponse.json({ id: data!.id, code: data!.code }, { status: 201 });
      }

      // 유니크키 충돌(23505): 번호 올리고 재시도
      if ((error as any)?.code === "23505") {
        seq += 1;
        lastError = error;
        continue;
      }

      // 기타 에러는 즉시 반환
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 재시도 모두 실패
    console.error("Insert conflict after retries:", lastError);
    return NextResponse.json({ error: "코드 발급 충돌로 등록 실패. 잠시 후 다시 시도해주세요." }, { status: 409 });
  } catch (e: any) {
    console.error("POST /api/properties failed:", e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
