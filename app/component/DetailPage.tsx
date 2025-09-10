// app/components/DetailPage.tsx
import Link from "next/link";

const TYPE_LABEL: Record<string, string> = {
  gas_station: "주유소",
  gas_lease: "주유소",
  charging_station: "충전소",
  rest_area: "휴게소",
};

const M2_PER_PYEONG = 3.305785;
function m2ToPyeongText(v: unknown): string {
  if (v === null || v === undefined || v === "") return "-";
  const raw = String(v).replace(/,/g, "").trim();
  const n = Number(raw);
  if (Number.isNaN(n)) return String(v);
  const py = n / M2_PER_PYEONG;
  return `${n}㎡ (${py.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}평)`;
}

type Property = {
  id: number;
  property_type: string;
  deal_type: "임대" | "매매";
  features?: string | null;
  price?: string | number | null;
  deposit?: string | number | null;
  monthly_rent?: string | number | null;
  area?: string | number | null;
  land_area?: string | number | null;
  building_area?: string | number | null;
  floor?: string | number | null;
  rooms_bathrooms?: string | null;
  approval_date?: string | null;
  parking_spaces?: string | number | null;
  pump_count?: string | number | null;
  storage_tank?: string | null;
  sales_volume?: string | number | null;
  pole?: string | null;
  loan?: string | number | null;
  facility_premium?: string | number | null;
  road_info?: string | null;
  location?: string | null;
  created_at?: string | null;
};

function InfoCard({ label, value, className = "" }: { label: string; value: string | number | null | undefined; className?: string }) {
  const displayValue = value ?? "-";
  return (
    <div className={`border border-zinc-400 bg-gray-50 ${className} flex`}>
      <div className="text-sm md:text-base bg-lime-700/30 text-zinc-800 font-medium  h-full w-28 text-center py-3">{label}</div>
      <div className="font-semibold text-gray-900 text-start flex items-center px-4">{displayValue}</div>
    </div>
  );
}

export default function DetailPage({ data }: { data: Property }) {
  const typeKo = TYPE_LABEL[data.property_type as keyof typeof TYPE_LABEL] ?? data.property_type;
  const title = `[${typeKo} ${data.deal_type}] ${data.features ?? ""}`.trim();
  const priceText = data.deal_type === "임대" ? `${data.deposit ?? "-"} / ${data.monthly_rent ?? "-"}` : `${data.price ?? "-"}`;
  const areaText = m2ToPyeongText(data.area);
  const landText = m2ToPyeongText(data.land_area);
  const buildingText = m2ToPyeongText(data.building_area);
  const dateText = data.created_at ? new Date(data.created_at).toISOString().slice(0, 10) : "-";
  const approvalDateText = data.approval_date ? String(data.approval_date).slice(0, 10) : "-";
  const propertyIdFormatted = String(data.id).padStart(8, "0");

  return (
    <section className="w-full my-20 md:mt-32">
      <div className="max-w-[860px] mx-auto">
        {/* 헤더 */}
        <div className="md:py-10 border-b mb-4 px-4">
          <div className="flex flex-col w-full justify-between">
            <div className="w-full">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-keep mb-2">{title}</h1>
              <div className="flex w-full flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600 mt-4">
                <span>등록일: {dateText}</span>
                <span>매물번호: {propertyIdFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          {/* 매물 정보 */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">매물 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              <InfoCard label="소재지" value={data.location} />
              <InfoCard label="유형 / 거래" value={`${typeKo} / ${data.deal_type}`} />
              <InfoCard label="금액" value={priceText} />
              <InfoCard label="면적(부지)" value={areaText} />
              <InfoCard label="세차기" value={landText} />
              <InfoCard label="건평" value={buildingText} />
              <InfoCard label="층수" value={data.floor} />
              <InfoCard label="부대시설" value={data.rooms_bathrooms} />
              <InfoCard label="사용승인일" value={approvalDateText} />
              <InfoCard label="주차대수" value={data.parking_spaces} />
              <InfoCard label="주유기 개수" value={data.pump_count} />
              <InfoCard label="저장탱크" value={data.storage_tank} />
              <InfoCard label="판매량" value={data.sales_volume} />
              <InfoCard label="폴" value={data.pole} />
              <InfoCard label="융자금" value={data.loan ?? "-"} />
              <InfoCard label="시설권리금" value={data.facility_premium ?? "-"} />
              <InfoCard label="도로 정보" value={data.road_info} className="w-full" />
            </div>
          </div>

          {/* 상세 특징 */}
          {data.features && (
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">상세 정보</h2>
              <div className="bg-gray-50 border rounded-lg p-6">
                <p className="whitespace-pre-wrap break-keep text-gray-700 leading-relaxed">{data.features}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center w-full gap-3 ">
        <Link href="/lease?category=gas-lease" className="px-4 py-2 my-10 w-full max-w-[820px] text-center text-sm bg-lime-700/30 border rounded-lg hover:bg-gray-50 transition-colors">
          목록으로
        </Link>
      </div>
    </section>
  );
}
