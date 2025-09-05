// app/properties/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type FormState = {
  location: string;
  area: string;
  property_type: "gas_station" | "site" | "charging_station" | "rest_area";
  floor: string;
  rooms_bathrooms: string;
  approval_date: string; // YYYY-MM-DD
  parking_spaces: string;
  deal_type: "매매" | "임대";
  price: string;
  pump_count: string;
  storage_tank: string;
  sales_volume: string;
  road_info: string;
  pole: string;
  deposit: string;
  monthly_rent: string;
  features: string;
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
};

function toNum(v: any) {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
function toNull(v: any) {
  return v === "" || v === undefined ? null : v;
}

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>(); // URL의 [id]
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) 기존 값 불러오기 (GET /api/properties/:id)
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

        setFormData({
          location: data.location ?? "",
          area: data.area ?? "",
          property_type: data.property_type ?? "gas_station",
          floor: data.floor ?? "",
          rooms_bathrooms: data.rooms_bathrooms ?? "",
          approval_date: data.approval_date ? String(data.approval_date).slice(0, 10) : "",
          parking_spaces: data.parking_spaces ?? "",
          deal_type: data.deal_type ?? "매매",
          price: data.price ?? "",
          pump_count: data.pump_count ?? "",
          storage_tank: data.storage_tank ?? "",
          sales_volume: data.sales_volume ?? "",
          road_info: data.road_info ?? "",
          pole: data.pole ?? "",
          deposit: data.deposit ?? "",
          monthly_rent: data.monthly_rent ?? "",
          features: data.features ?? "",
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

  // 2) PATCH /api/properties/:id
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      location: toNull(formData.location),
      area: toNum(formData.area),
      property_type: formData.property_type,
      floor: toNum(formData.floor),
      rooms_bathrooms: toNull(formData.rooms_bathrooms),
      approval_date: toNull(formData.approval_date),
      parking_spaces: toNum(formData.parking_spaces),
      deal_type: formData.deal_type,
      price: toNum(formData.price),
      pump_count: toNum(formData.pump_count),
      storage_tank: toNull(formData.storage_tank),
      sales_volume: toNum(formData.sales_volume),
      road_info: toNull(formData.road_info),
      pole: toNull(formData.pole),
      deposit: toNum(formData.deposit),
      monthly_rent: toNum(formData.monthly_rent),
      features: toNull(formData.features),
    };

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "수정 실패");
      }
      alert("수정 완료!");
      router.push("/manager"); // 수정 후 관리자 리스트로
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto p-6 mt-20 md:mt-40">불러오는 중…</div>;
  if (error) return <div className="max-w-3xl mx-auto p-6 text-red-600 mt-20 md:mt-40">에러: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6  bg-white shadow rounded my-20 md:mt-40">
      <h1 className="text-xl font-bold mb-4">부동산 수정</h1>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">소재지</span>
          <input id="location" name="location" value={formData.location} placeholder="소재지" className="border p-2" onChange={handleChange} required />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">면적 (㎡)</span>
          <input id="area" name="area" value={formData.area} placeholder="면적 (㎡)" step="0.01" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">매물 유형</span>
          <select id="property_type" name="property_type" value={formData.property_type} className="border p-2" onChange={handleChange}>
            <option value="gas_station">주유소 임대</option>
            <option value="gas_lease">주유소 매매</option>
            <option value="charging_station">충전소</option>
            <option value="rest_area">부지매매</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">층수</span>
          <input id="floor" name="floor" value={formData.floor} placeholder="층수" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">방수 및 욕실</span>
          <input id="rooms_bathrooms" name="rooms_bathrooms" value={formData.rooms_bathrooms} placeholder="예: 방2 욕실1" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">사용승인일</span>
          <input id="approval_date" name="approval_date" value={formData.approval_date} type="date" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">주차대수</span>
          <input id="parking_spaces" name="parking_spaces" value={formData.parking_spaces} placeholder="주차대수" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">거래형태</span>
          <select id="deal_type" name="deal_type" value={formData.deal_type} className="border p-2" onChange={handleChange}>
            <option value="매매">매매</option>
            <option value="임대">임대</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">가격(원)</span>
          <input id="price" name="price" value={formData.price} placeholder="가격 (원)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">주유기 개수</span>
          <input id="pump_count" name="pump_count" value={formData.pump_count} placeholder="주유기개수" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">저장탱크</span>
          <input id="storage_tank" name="storage_tank" value={formData.storage_tank} placeholder="저장탱크" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">판매량</span>
          <input id="sales_volume" name="sales_volume" value={formData.sales_volume} placeholder="판매량" step="0.01" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">도로 정보</span>
          <input id="road_info" name="road_info" value={formData.road_info} placeholder="도로 정보" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">폴(가능여부)</span>
          <input id="pole" name="pole" value={formData.pole} placeholder="폴 (가능여부)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">보증금(원)</span>
          <input id="deposit" name="deposit" value={formData.deposit} placeholder="보증금 (원)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">월세(원)</span>
          <input id="monthly_rent" name="monthly_rent" value={formData.monthly_rent} placeholder="월세 (원)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1 col-span-full">
          <span className="text-sm text-zinc-600">특징</span>
          <textarea id="features" name="features" value={formData.features} placeholder="특징" className="border p-2" onChange={handleChange} />
        </label>

        <button type="submit" disabled={saving} className="bg-lime-500 text-white py-3 rounded hover:bg-lime-600 disabled:opacity-50">
          {saving ? "수정 중…" : "수정하기"}
        </button>
      </form>
    </div>
  );
}
