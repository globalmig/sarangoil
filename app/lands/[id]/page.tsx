// app/properties/[id]/page.tsx
export const dynamic = "force-dynamic";

import { createSupabaseServer } from "@/app/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

const TYPE_LABEL: Record<string, string> = {
  gas_station: "주유소",
  gas_lease: "주유소",
  charging_station: "충전소",
  rest_area: "휴게소",
};

interface InfoCardProps {
  label: string;
  value: string | number | null;
  className?: string;
}

function InfoCard({ label, value, className = "" }: InfoCardProps) {
  const displayValue = value ?? "-";
  return (
    <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <div className="font-semibold text-gray-900">{displayValue}</div>
    </div>
  );
}

export default async function PropertyDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();

  if (error || !data) notFound();

  // 데이터 포맷팅
  const typeKo = TYPE_LABEL[data.property_type as keyof typeof TYPE_LABEL] ?? data.property_type;
  const title = `[${typeKo} ${data.deal_type}] ${data.features ?? ""}`.trim();
  const priceText = data.deal_type === "임대" ? `${data.deposit} / ${data.monthly_rent}` : `${data.price}`;
  const areaText = typeof data.area === "number" ? `${data.area}㎡` : data.area ? `${data.area}㎡` : "-";
  const dateText = data.created_at ? new Date(data.created_at).toISOString().slice(0, 10) : "";
  const approvalDateText = data.approval_date ? String(data.approval_date).slice(0, 10) : "-";
  const propertyIdFormatted = String(data.id).padStart(8, "0");

  return (
    <section className=" w-full my-20 md:mt-40">
      <div className="max-w-5xl mx-auto ">
        {/* 헤더 */}
        <div className=" md:py-10  border-b mb-4 px-4">
          <div className="flex flex-col w-full justify-between ">
            <div className="w-full">
              <h1 className="text-2xl  md:text-3xl font-bold text-gray-900 break-keep mb-2">{title}</h1>
              <div className="flex  w-full  flex-col md:flex-row  md:items-center gap-4 text-sm text-gray-600 mt-4">
                <span>등록일: {dateText}</span>
                <span>매물번호: {propertyIdFormatted}</span>
              </div>
            </div>
            <div className="flex justify-end w-full gap-3">
              <Link href="lands?category=rest-area" className="px-4 py-2 my-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                목록으로
              </Link>
              {/* <Link 
                href={`/properties/${id}/edit`} 
                className="px-4 py-2 text-sm bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
              >
                수정
              </Link> */}
            </div>
          </div>
        </div>

        <div className="px-4 py-6  border rounded-xl shadow-lg bg-zinc-100/90">
          {/* 기본 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard label="소재지" value={data.location} />
              <InfoCard label="유형 / 거래" value={`${typeKo} / ${data.deal_type}`} />
              <InfoCard label="금액" value={priceText} className="md:col-span-1" />
              <InfoCard label="면적" value={areaText} />
              <InfoCard label="층수" value={data.floor} />
              <InfoCard label="방/욕실" value={data.rooms_bathrooms} />
              <InfoCard label="사용승인일" value={approvalDateText} />
              <InfoCard label="주차대수" value={data.parking_spaces} />
            </div>
          </div>

          {/* 시설 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">시설 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard label="주유기 개수" value={data.pump_count} />
              <InfoCard label="저장탱크" value={data.storage_tank} />
              <InfoCard label="판매량" value={data.sales_volume} />
              <InfoCard label="폴" value={data.pole} />
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">위치 정보</h2>
            <div className="grid grid-cols-1 gap-4">
              <InfoCard label="도로 정보" value={data.road_info} className="w-full" />
            </div>
          </div>

          {/* 특징 */}
          {data.features && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">특징</h2>
              <div className="bg-gray-50 border rounded-lg p-6">
                <p className="whitespace-pre-wrap break-keep text-gray-700 leading-relaxed">{data.features}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
