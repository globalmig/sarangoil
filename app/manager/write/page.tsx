// app/properties/new/page.tsx
"use client";

import { useState } from "react";

export default function PropertyForm() {
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/properties", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("등록 완료!");
    } else {
      alert("등록 실패 😢");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded my-20 md:mt-40">
      <h1 className="text-xl font-bold mb-4">부동산 등록</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">소재지</span>
          <input id="location" name="location" placeholder="소재지" className="border p-2" onChange={handleChange} required />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">면적 (㎡)</span>
          <input id="area" name="area" placeholder="면적 (m²)" step="0.01" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">매물 유형</span>
          <select id="property_type" name="property_type" className="border p-2" onChange={handleChange}>
            <option value="gas_station">주유소 임대</option>
            <option value="site">주유소 매매</option>
            <option value="charging_station">충전소</option>
            <option value="rest_area">부지매매</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">층수</span>
          <input id="floor" name="floor" placeholder="층수" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">방수 및 욕실</span>
          <input id="rooms_bathrooms" name="rooms_bathrooms" placeholder="방수 및 욕실 (예: 방2 욕실1)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">사용승인일</span>
          <input id="approval_date" name="approval_date" type="date" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">주차대수</span>
          <input id="parking_spaces" name="parking_spaces" placeholder="주차대수" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">거래형태</span>
          <select id="deal_type" name="deal_type" className="border p-2" onChange={handleChange}>
            <option value="매매">매매</option>
            <option value="임대">임대</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">가격(원)</span>
          <input id="price" name="price" placeholder="가격 (원)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">주유기 개수</span>
          <input id="pump_count" name="pump_count" placeholder="주유기개수" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">저장탱크</span>
          <input id="storage_tank" name="storage_tank" placeholder="저장탱크" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">판매량</span>
          <input id="sales_volume" name="sales_volume" placeholder="판매량" step="0.01" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">도로 정보</span>
          <input id="road_info" name="road_info" placeholder="도로 정보" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">폴(가능여부)</span>
          <input id="pole" name="pole" placeholder="폴 (가능여부)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">보증금(원)</span>
          <input id="deposit" name="deposit" placeholder="보증금 (원)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">월세(원)</span>
          <input id="monthly_rent" name="monthly_rent" placeholder="월세 (원)" className="border p-2" onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1 col-span-full">
          <span className="text-sm text-zinc-600">특징</span>
          <textarea id="features" name="features" placeholder="특징" className="border p-2" onChange={handleChange} />
        </label>

        <button type="submit" className="bg-lime-500 text-white py-3  p-2 rounded hover:bg-blue-700">
          등록하기
        </button>
      </form>
    </div>
  );
}
