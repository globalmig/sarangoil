// app/properties/[id]/edit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const M2_PER_PYEONG = 3.305785;
const toPyeong = (m2Text: string) => {
  const n = parseFloat(
    String(m2Text ?? "")
      .replace(/,/g, "")
      .trim()
  );
  if (!isFinite(n)) return null;
  return n / M2_PER_PYEONG;
};
const fmtPyeong = (v: number | null) => (v == null ? null : v.toLocaleString("ko-KR", { maximumFractionDigits: 1 }));

type FormState = {
  location: string;
  area: string; // m² (text)
  property_type: "gas_station" | "charging_station" | "rest_area";
  floor: string;
  rooms_bathrooms: string;
  approval_date: string; // YYYY-MM-DD (text 허용)
  parking_spaces: string;
  deal_type: "매매" | "임대";
  price: string; // text
  pump_count: string; // text
  storage_tank: string; // text
  sales_volume: string; // text
  road_info: string; // text
  pole: string; // text
  deposit: string; // text
  monthly_rent: string; // text
  features: string; // text
  // ✅ 추가 컬럼
  loan: string; // text
  land_area: string; // m² (text)
  building_area: string; // m² (text)
  facility_premium: string; // text
  is_recommended: boolean;
  is_urgent: boolean;
};

const EMPTY: FormState = {
  location: "",
  area: "",
  property_type: "gas_station",
  floor: "",
  rooms_bathrooms: "",
  approval_date: "",
  parking_spaces: "",
  deal_type: "매매",
  price: "",
  pump_count: "",
  storage_tank: "",
  sales_volume: "",
  road_info: "",
  pole: "",
  deposit: "",
  monthly_rent: "",
  features: "",
  loan: "",
  land_area: "",
  building_area: "",
  facility_premium: "",
  is_recommended: false,
  is_urgent: false,
};

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>(); // URL [id]
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 평 환산 값 (표시용)
  const areaP = useMemo(() => fmtPyeong(toPyeong(formData.area)), [formData.area]);
  const landP = useMemo(() => fmtPyeong(toPyeong(formData.land_area)), [formData.land_area]);
  const buildingP = useMemo(() => fmtPyeong(toPyeong(formData.building_area)), [formData.building_area]);

  const isLease = formData.deal_type === "임대";

  // 1) 기존 값 불러오기
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/properties/${id}`, { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "불러오기 실패");
        }
        const { data } = await res.json();

        const asText = (v: any) => (v === null || v === undefined ? "" : String(v));
        const asBool = (v: any) => Boolean(v); // ✅ 불리언 안전 변환

        const pt = ((): FormState["property_type"] => {
          const raw = String(data.property_type ?? "gas_station");
          if (raw === "gas_station" || raw === "charging_station" || raw === "rest_area") return raw;
          return "gas_station";
        })();

        setFormData({
          location: asText(data.location),
          area: asText(data.area),
          property_type: pt,
          floor: asText(data.floor),
          rooms_bathrooms: asText(data.rooms_bathrooms),
          approval_date: asText(data.approval_date).slice(0, 10),
          parking_spaces: asText(data.parking_spaces),
          deal_type: (data.deal_type === "임대" ? "임대" : "매매") as FormState["deal_type"],
          price: asText(data.price),
          pump_count: asText(data.pump_count),
          storage_tank: asText(data.storage_tank),
          sales_volume: asText(data.sales_volume),
          road_info: asText(data.road_info),
          pole: asText(data.pole),
          deposit: asText(data.deposit),
          monthly_rent: asText(data.monthly_rent),
          features: asText(data.features),
          // ✅ 추가 컬럼 불러오기
          loan: asText(data.loan),
          land_area: asText(data.land_area),
          building_area: asText(data.building_area),
          facility_premium: asText(data.facility_premium),
          is_recommended: asBool(data.is_recommended),
          is_urgent: asBool(data.is_urgent),
        });
      } catch (e: any) {
        setError(e.message ?? "불러오기 중 오류");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ 체크박스 전용 체인지 핸들러
  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // 2) 저장 (모든 값 text/boolean 그대로 PATCH)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      alert("소재지는 필수입니다.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // ✅ is_recommended / is_urgent 포함
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "수정 실패");
      }
      alert("수정 완료!");
      router.push("/manager");
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-[1440px] mx-auto w-full justify-center items-center p-6 mt-20 md:mt-40">불러오는 중…</div>;
  if (error) return <div className="max-w-[1440px] mx-auto p-6 text-red-600 mt-20 md:mt-40">에러: {error}</div>;

  return (
    <div className="max-w-[840px] mx-auto p-6 bg-white shadow rounded my-20 md:mt-40">
      <h1 className="text-3xl font-bold mb-4">부동산 수정</h1>

      <form onSubmit={handleSubmit}>
        {/* 거래형태 */}
        <label className="flex flex-col gap-1 col-span-1">
          <span className="text-sm text-zinc-600">거래형태</span>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="deal_type" value="매매" checked={formData.deal_type === "매매"} onChange={handleChange} />
              매매
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="deal_type" value="임대" checked={formData.deal_type === "임대"} onChange={handleChange} />
              임대
            </label>
          </div>
        </label>

        {/* ✅ 추천/급매 토글 */}
        <div className="flex gap-6 my-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_recommended" checked={formData.is_recommended} onChange={handleCheck} />
            추천
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleCheck} />
            급매
          </label>
        </div>

        {/* 입력 필드 */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-10">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">소재지</span>
            <input id="location" name="location" value={formData.location} placeholder="소재지" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" required />
          </label>

          {/* DB 허용값과 라벨 정리 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">매물 유형</span>
            <select id="property_type" name="property_type" className="border-2 bg-zinc-100/40 p-2.5" value={formData.property_type} onChange={handleChange}>
              <option value="gas_station">주유소</option>
              <option value="charging_station">충전소</option>
              <option value="rest_area">휴게소</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">층수</span>
            <input id="floor" name="floor" value={formData.floor} placeholder="층수" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">부대시설</span>
            <input id="rooms_bathrooms" name="rooms_bathrooms" value={formData.rooms_bathrooms} placeholder="부대시설" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">사용승인일</span>
            <input id="approval_date" name="approval_date" value={formData.approval_date} placeholder="YYYY-MM-DD" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">도로 현황</span>
            <input id="road_info" name="road_info" value={formData.road_info} placeholder="도로 현황" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          {/* 금액 UX: 임대/매매 분기 (모두 text) */}
          {isLease ? (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-zinc-600">보증금(원)</span>
                <input id="deposit" name="deposit" value={formData.deposit} placeholder="예: 100000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-zinc-600">월세(원)</span>
                <input id="monthly_rent" name="monthly_rent" value={formData.monthly_rent} placeholder="예: 3000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
              </label>
            </>
          ) : (
            <label className="flex flex-col gap-1">
              <span className="text-sm text-zinc-600">매매가(원)</span>
              <input id="price" name="price" value={formData.price} placeholder="예: 1500000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
            </label>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">융자금(원)</span>
            <input id="loan" name="loan" value={formData.loan} placeholder="예: 300000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">저장탱크(용량)</span>
            <input id="storage_tank" name="storage_tank" value={formData.storage_tank} placeholder="예: 3기 / 90kL" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">주유기(대)</span>
            <input id="pump_count" name="pump_count" value={formData.pump_count} placeholder="예: 6" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          {/* 면적류: m² 입력 → 평 자동 표시 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">부지 면적(㎡)</span>
            <input id="area" name="area" value={formData.area} placeholder="예: 1200" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
            {areaP && <span className="text-xs text-zinc-500">≈ {areaP} 평</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">세차기</span>
            <input id="land_area" name="land_area" value={formData.land_area} placeholder="세차기 여부" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
            {landP && <span className="text-xs text-zinc-500">≈ {landP} 세차기 여부</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">건평(㎡)</span>
            <input id="building_area" name="building_area" value={formData.building_area} placeholder="예: 150" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
            {buildingP && <span className="text-xs text-zinc-500">≈ {buildingP} 평</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">폴(변경가능여부)</span>
            <input id="pole" name="pole" value={formData.pole} placeholder="예: 가능/협의/불가" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">판매량(드럼)</span>
            <input id="sales_volume" name="sales_volume" value={formData.sales_volume} placeholder="" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">시설권리금(원)</span>
            <input
              id="facility_premium"
              name="facility_premium"
              value={formData.facility_premium}
              placeholder="예: 80000000"
              className="border-2 bg-zinc-100/40 p-2"
              onChange={handleChange}
              type="text"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 col-span-full">
          <span className="text-sm text-zinc-600">특징</span>
          <textarea id="features" name="features" value={formData.features} placeholder="특이사항, 조건, 메모 등" className="border-2 bg-zinc-100/40 p-2 h-48" onChange={handleChange} />
        </label>

        <button type="submit" disabled={saving} className="bg-zinc-800 text-white py-3 w-full my-10 p-2 rounded hover:bg-lime-600 disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? "수정 중…" : "수정하기"}
        </button>
      </form>
    </div>
  );
}
