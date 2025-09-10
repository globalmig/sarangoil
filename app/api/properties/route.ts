export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/app/supabase/server";

const toNull = (v: any) => (v === "" || v === undefined ? null : v);

// "1,000", " 1 200 ", "보증금 3,000", "문의" 모두 처리
// 숫자가 전혀 없으면 null 반환
const toNumLoose = (v: any) => {
  if (v === "" || v === undefined || v === null) return null;
  const s = String(v).replace(/,/g, "");
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
};

// 서울 타임존 기준 YYYYMMDD 프리픽스 생성
function getKstYmd() {
  const now = new Date();
  // KST(UTC+9) 보정
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`; // 예: 20250910
}

// 일련번호를 2자리(01,02...) 혹은 3자리로 바꾸려면 padLen 변경
function buildCode(ymd: string, seq: number, padLen = 2) {
  return `${ymd}${String(seq).padStart(padLen, "0")}`;
}

export async function POST(req: Request) {
  const supabase = createSupabaseServer();

  try {
    const raw = await req.json();

    // 클라이언트 바디 정리 (숫자 필드는 관대 파서 사용)
    const payload = {
      location: toNull(raw.location),
      area: toNumLoose(raw.area),
      property_type: toNull(raw.property_type),
      floor: toNumLoose(raw.floor),
      rooms_bathrooms: toNull(raw.rooms_bathrooms),
      approval_date: toNull(raw.approval_date), // DB가 text면 그대로, date면 YYYY-MM-DD만 허용됨
      parking_spaces: toNumLoose(raw.parking_spaces),
      deal_type: toNull(raw.deal_type),
      price: toNumLoose(raw.price),
      pump_count: toNumLoose(raw.pump_count),
      storage_tank: toNull(raw.storage_tank),
      sales_volume: toNumLoose(raw.sales_volume),
      road_info: toNull(raw.road_info),
      pole: toNull(raw.pole),
      deposit: toNumLoose(raw.deposit),
      monthly_rent: toNumLoose(raw.monthly_rent),
      features: toNull(raw.features),

      // ✅ 추천/급매 플래그 반영
      is_recommended: Boolean(raw.is_recommended),
      is_urgent: Boolean(raw.is_urgent),
    };

    // 1) 오늘 날짜 프리픽스와 시작 번호 계산
    const ymd = getKstYmd();

    // 오늘 이미 발급된 코드 수를 기반으로 시작 번호 설정 (예: count=5면 6부터)
    const { count, error: countErr } = await supabase.from("properties").select("code", { count: "exact", head: true }).ilike("code", `${ymd}%`);

    if (countErr) {
      console.error("Count error:", countErr);
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }

    let seq = (count ?? 0) + 1;

    // 2) 중복 충돌 시 재시도 (동시성 대비)
    const MAX_RETRY = 5; // 필요시 늘려도 됨
    let lastError: any = null;

    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      const code = buildCode(ymd, seq, 2); // ← 일련번호 자릿수(2) 조정 가능

      const { data, error } = await supabase
        .from("properties")
        .insert({ ...payload, code })
        .select("id, code")
        .single();

      if (!error) {
        // 성공
        return NextResponse.json({ id: data.id, code: data.code }, { status: 201 });
      }

      // 유니크 충돌 (Postgres unique_violation: 23505) → 번호 올려서 재시도
      if ((error as any)?.code === "23505") {
        seq += 1;
        lastError = error;
        continue;
      }

      // 그 외 에러는 즉시 반환
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 재시도 끝났는데도 실패
    console.error("Insert conflict after retries:", lastError);
    return NextResponse.json({ error: "코드 발급 충돌로 등록 실패. 잠시 후 다시 시도해주세요." }, { status: 409 });
  } catch (e: any) {
    console.error("POST /api/properties failed:", e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
