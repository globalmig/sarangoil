// app/properties/new/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const M2_PER_PYEONG = 3.305785;
const toPyeong = (m2Text: string) => {
  const n = parseFloat(m2Text.replace(/,/g, "").trim());
  if (!isFinite(n)) return null;
  return n / M2_PER_PYEONG;
};
const fmtPyeong = (v: number | null) => (v == null ? null : v.toLocaleString("ko-KR", { maximumFractionDigits: 1 }));

type FormDataType = {
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
  loan: string; // text
  land_area: string; // m² (text)
  building_area: string; // m² (text)
  facility_premium: string; // text
};

export default function PropertyForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>({
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
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 평 환산 값 (표시용)
  const areaP = useMemo(() => fmtPyeong(toPyeong(formData.area)), [formData.area]);
  const landP = useMemo(() => fmtPyeong(toPyeong(formData.land_area)), [formData.land_area]);
  const buildingP = useMemo(() => fmtPyeong(toPyeong(formData.building_area)), [formData.building_area]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.location.trim()) {
      setErrorMsg("소재지는 필수입니다.");
      return;
    }

    // ⚠️ 모든 값은 텍스트 그대로 전송 (요청 반영)
    const res = await fetch("/api/properties", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("등록 완료!");
      router.push("/manager");
      // 필요하면 초기화
      // setFormData({...formData, location:"", ...})
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data?.error ?? "등록 실패 😢");
    }
  };

  const isLease = formData.deal_type === "임대";

  return (
    <div className="max-w-[840px] mx-auto p-6 bg-white shadow rounded my-20 md:mt-32">
      <h1 className="text-3xl font-bold mb-4">부동산 등록</h1>

      {errorMsg && <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">{errorMsg}</div>}

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

        {/* 필드들 */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-10">
          <label className="flex flex-col gap-1 ">
            <span className="text-sm text-zinc-600 ">소재지</span>
            <input id="location" name="location" placeholder="소재지" value={formData.location} className="border-2 p-2 bg-zinc-100/40" onChange={handleChange} type="text" required />
          </label>

          {/* DB 허용값과 라벨 정리 */}
          <label className="flex flex-col gap-1 ">
            <span className="text-sm text-zinc-600">매물 유형</span>
            <select id="property_type" name="property_type" className="border-2 bg-zinc-100/40 p-2.5" value={formData.property_type} onChange={handleChange}>
              <option value="gas_station">주유소</option>
              <option value="charging_station">충전소</option>
              <option value="rest_area">휴게소</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">층수</span>
            <input id="floor" name="floor" placeholder="층수" className="border-2 bg-zinc-100/40 p-2 " onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">부대시설</span>
            <input id="rooms_bathrooms" name="rooms_bathrooms" placeholder="부대시설" className="border-2 bg-zinc-100/40 p-2 " onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">사용승인일</span>
            <input id="approval_date" name="approval_date" placeholder="YYYY-MM-DD" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">도로 현황</span>
            <input id="road_info" name="road_info" placeholder="도로 현황" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          {/* 금액 UX: 임대/매매 분기하되 타입은 text */}
          {isLease ? (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-zinc-600">보증금(원)</span>
                <input id="deposit" name="deposit" placeholder="예: 100000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-zinc-600">월세(원)</span>
                <input id="monthly_rent" name="monthly_rent" placeholder="예: 3000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
              </label>
            </>
          ) : (
            <label className="flex flex-col gap-1">
              <span className="text-sm text-zinc-600">매매가(원)</span>
              <input id="price" name="price" placeholder="예: 1500000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
            </label>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">융자금(원)</span>
            <input id="loan" name="loan" placeholder="예: 300000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">저장탱크(용량)</span>
            <input id="storage_tank" name="storage_tank" placeholder="예: 500" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">주유기(대)</span>
            <input id="pump_count" name="pump_count" placeholder="예: 6" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          {/* ✅ 면적류: m² 입력 → 평 자동 계산 표시 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">부지 면적(㎡)</span>
            <input id="area" name="area" placeholder="예: 1200" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} value={formData.area} type="text" />
            {areaP && <span className="text-xs text-zinc-500">≈ {areaP} 평</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">세차기</span>
            <input id="land_area" name="land_area" placeholder="예: 500" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} value={formData.land_area} type="text" />
            {landP && <span className="text-xs text-zinc-500">≈ {landP} 세차기 보유</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">건평(㎡)</span>
            <input id="building_area" name="building_area" placeholder="예: 150" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} value={formData.building_area} type="text" />
            {buildingP && <span className="text-xs text-zinc-500">≈ {buildingP} 평</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">폴(변경가능여부)</span>
            <input id="pole" name="pole" placeholder="예: 가능/협의/불가" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">판매량(드럼)</span>
            <input id="sales_volume" name="sales_volume" placeholder="예: 300000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600">시설권리금(원)</span>
            <input id="facility_premium" name="facility_premium" placeholder="예: 80000000" className="border-2 bg-zinc-100/40 p-2" onChange={handleChange} type="text" />
          </label>
        </div>

        <label className="flex flex-col gap-1 col-span-full">
          <span className="text-sm text-zinc-600">특징</span>
          <textarea id="features" name="features" placeholder="특이사항, 조건, 메모 등" className="border-2 bg-zinc-100/40 p-2 h-48" onChange={handleChange} />
        </label>

        <button type="submit" disabled={loading} className="bg-lime-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 w-full my-10 p-2 rounded hover:bg-lime-600">
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
