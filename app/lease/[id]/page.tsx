// app/properties/[id]/page.tsx
export const dynamic = "force-dynamic";

import { createSupabaseServer } from "@/app/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

const TYPE_LABEL: Record<string, string> = {
  gas_station: "주유소",
  gas_lease: "주유소 임대",
  charging_station: "충전소",
  rest_area: "휴게소",
};

// function formatManwon(v: number | null | undefined) {
//   if (v == null) return "-";
//   const man = Math.round(v / 10000);
//   return `${man.toLocaleString("ko-KR")}만원`;
// }

export default async function PropertyDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();

  if (error || !data) notFound();

  const typeKo = TYPE_LABEL[data.property_type as keyof typeof TYPE_LABEL] ?? data.property_type;
  const title = `[${typeKo} ${data.deal_type}] ${data.features ?? ""}`.trim();
  const priceText = data.deal_type === "임대" ? `${data.deposit} / ${data.monthly_rent}` : `${data.price}`;
  const areaText = typeof data.area === "number" ? `${data.area}㎡` : data.area ? `${data.area}㎡` : "-";
  const dateText = data.created_at ? new Date(data.created_at).toISOString().slice(0, 10) : "";

  return (
    <section className="my-10 w-full px-4 mt-20 md:mt-40">
      <div className="max-w-[960px] mx-auto bg-white border rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold break-keep">{title}</h1>
          <div className="flex gap-2">
            <Link href="/lease" className="text-sm text-zinc-600 hover:underline">
              목록으로
            </Link>
            {/* <Link href={`/properties/${id}/edit`} className="text-sm text-lime-700 hover:underline">
              수정
            </Link> */}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border rounded p-3">
            <div className="text-zinc-500">매물번호</div>
            <div className="font-medium">{String(data.id).padStart(8, "0")}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">등록일</div>
            <div className="font-medium">{dateText}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">소재지</div>
            <div className="font-medium">{data.location ?? "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">유형 / 거래</div>
            <div className="font-medium">
              {typeKo} / {data.deal_type}
            </div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">금액</div>
            <div className="font-medium">{priceText}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">면적</div>
            <div className="font-medium">{areaText}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">층수</div>
            <div className="font-medium">{data.floor ?? "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">방/욕실</div>
            <div className="font-medium">{data.rooms_bathrooms ?? "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">사용승인일</div>
            <div className="font-medium">{data.approval_date ? String(data.approval_date).slice(0, 10) : "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">주차대수</div>
            <div className="font-medium">{data.parking_spaces ?? "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">주유기 개수</div>
            <div className="font-medium">{data.pump_count ?? "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">저장탱크</div>
            <div className="font-medium">{data.storage_tank ?? "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">판매량</div>
            <div className="font-medium">{data.sales_volume ?? "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">도로</div>
            <div className="font-medium">{data.road_info ?? "-"}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-zinc-500">폴</div>
            <div className="font-medium">{data.pole ?? "-"}</div>
          </div>
        </div>

        {data.features && (
          <div className="mt-6 border rounded p-4">
            <div className="text-zinc-500 mb-1">특징</div>
            <p className="whitespace-pre-wrap break-keep">{data.features}</p>
          </div>
        )}
      </div>
    </section>
  );
}
