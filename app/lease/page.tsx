// app/your-list-page/page.tsx
export const dynamic = "force-dynamic";

import React from "react";
import Search from "../component/Search";
import { createSupabaseServer } from "@/app/supabase/server";
import Link from "next/link";

const MAX_FEATURE_CHARS = 40;

function truncateText(input: unknown, max = MAX_FEATURE_CHARS) {
  const text = String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  return chars.slice(0, max).join("") + "…";
}

type Row = {
  id: string;
  location: string;
  title: string;
  titleFull?: string;
  isRecommended?: boolean;
  dealType: "임" | "매";
  price: string;
  area: string;
  date: string;
};

const TYPE_LABEL: Record<string, string> = {
  gas_station: "주유소",
  gas_lease: "주유소",
  charging_station: "충전소",
  rest_area: "휴게소",
};

export default async function Page({ searchParams }: { searchParams?: { category?: string; dealType?: string; listingId?: string } }) {
  const category = (searchParams?.category ?? "lease").toLowerCase();
  const dealTypeParam = (searchParams?.dealType ?? "").toLowerCase();
  const listingId = (searchParams?.listingId ?? "").trim().toLowerCase();

  const supabase = createSupabaseServer();

  // 카테고리 → property_type / deal_type 맵
  let propertyTypeFilter: string | undefined;
  let dealTypeFromCategory: "매매" | "임대" | undefined;

  if (category === "gas-lease") {
    propertyTypeFilter = "gas_lease";
    dealTypeFromCategory = "임대";
  } else if (category === "gas-station") {
    propertyTypeFilter = "gas_station";
    dealTypeFromCategory = "매매";
  } else if (category === "charging-station") {
    propertyTypeFilter = "charging_station";
  } else if (category === "rest-area") {
    propertyTypeFilter = "rest_area";
  }

  const dealTypeFilter = dealTypeParam === "lease" ? "임대" : dealTypeParam === "sale" ? "매매" : undefined;

  // ✅ 쿼리: 최신 created_at 우선, 동일 시 id 내림차순, NULLS LAST
  let query = supabase
    .from("properties")
    .select("id, location, features, property_type, deal_type, price, deposit, monthly_rent, area, created_at")
    .order("created_at", { ascending: false, nullsFirst: false }) // NULL은 뒤로
    .order("id", { ascending: false }) // 같은 시각이면 더 큰 id 먼저
    .limit(100);

  if (propertyTypeFilter) query = query.eq("property_type", propertyTypeFilter);
  if (dealTypeFromCategory) query = query.eq("deal_type", dealTypeFromCategory);
  if (dealTypeFilter) query = query.eq("deal_type", dealTypeFilter);

  // listingId 숫자면 =, 아니면 후처리 부분검색
  const idNum = Number(listingId);
  const useEqId = listingId !== "" && !Number.isNaN(idNum);
  if (useEqId) query = query.eq("id", idNum);

  const { data, error } = await query;
  if (error) console.error("properties fetch error:", error);

  let rows: Row[] =
    (data ?? []).map((r: any) => {
      const typeKo = TYPE_LABEL[r.property_type as keyof typeof TYPE_LABEL] ?? r.property_type;
      const featuresFull = String(r.features ?? "");
      const featuresShort = truncateText(featuresFull);

      const titleFull = `[${typeKo}${r.deal_type}] ${featuresFull || r.location || ""}`.trim();
      const title = `[${typeKo}${r.deal_type}] ${featuresShort || r.location || ""}`.trim();

      const dealTypeShort: "임" | "매" = r.deal_type === "임대" ? "임" : "매";
      const priceText = r.deal_type === "임대" ? `${r.deposit} / ${r.monthly_rent}` : `${r.price}`;
      const areaText = typeof r.area === "number" ? `${r.area}㎡` : r.area ? `${r.area}㎡` : "-";
      const dateText = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "";

      return {
        id: String(r.id).padStart(8, "0"),
        location: r.location ?? "-",
        title,
        titleFull,
        isRecommended: featuresFull.includes("추천"),
        dealType: dealTypeShort,
        price: priceText,
        area: areaText,
        date: dateText,
      };
    }) ?? [];

  if (!useEqId && listingId) {
    rows = rows.filter((row) => row.id.toLowerCase().includes(listingId));
  }

  return (
    <section className="my-10 w-full px-4 mt-20 md:mt-40">
      <div className="max-w-[1440px] w-full mx-auto">
        <h2 className="text-xl md:text-2xl font-bold my-5 md:my-10 text-center">주유소 임대</h2>

        <Search />

        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 ">
          {/* 데스크톱 테이블 */}
          <table className="hidden md:table w-full border-collapse text-sm">
            <thead className="bg-zinc-50 sticky top-0 z-10">
              <tr className="text-center text-zinc-600">
                <th className="px-4 py-3 border">매물번호</th>
                <th className="px-4 py-3 border">소재지</th>
                <th className="px-4 py-3 border text-left">매물특징</th>
                <th className="px-4 py-3 border">금액</th>
                <th className="px-4 py-3 border">면적</th>
                <th className="px-4 py-3 border">날짜</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="bg-white hover:bg-zinc-50">
                  <td className="px-4 py-3 border text-center whitespace-nowrap align-middle">{row.id}</td>
                  <td className="px-4 py-3 border align-middle">{row.location}</td>
                  <td className="px-4 py-3 border align-middle">
                    <div className="flex items-center gap-2">
                      {row.isRecommended && <span className="inline-flex items-center rounded-sm bg-lime-500/90 text-white text-[11px] font-semibold px-2 py-0.5 animate-pulse">추천</span>}
                      <Link href={`/lease/${String(row.id)}`}>
                        <span className="break-keep" title={row.titleFull}>
                          {row.title}
                        </span>
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 border align-middle">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-sm text-white text-[11px] font-semibold px-1.5 py-0.5 ${row.dealType === "임" ? "bg-red-500" : "bg-blue-600"}`}
                        title={row.dealType === "임" ? "임대" : "매매"}
                      >
                        {row.dealType}
                      </span>
                      <span className="whitespace-nowrap">{row.price}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border text-center whitespace-nowrap align-middle">{row.area}</td>
                  <td className="px-4 py-3 border text-center whitespace-nowrap align-middle">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 모바일 카드 */}
          <ul className="md:hidden divide-y divide-zinc-200">
            {rows.map((row) => (
              <li key={row.id} className="bg-white p-4 pb-10 border-b">
                <Link href={`/lease/${String(row.id)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{row.date}</span>
                    <span className={`inline-flex items-center rounded-sm text-white text-[11px] font-semibold px-1.5 py-0.5 ${row.dealType === "임" ? "bg-red-500" : "bg-blue-600"}`}>
                      {row.dealType}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">매물번호 {row.id}</div>

                  <h3 className="mt-2 font-medium break-keep" title={row.titleFull}>
                    {row.isRecommended && <span className="mr-2 inline-flex items-center rounded-sm bg-lime-500/90 text-white text-[11px] font-semibold p-2 animate-pulse">추천</span>}
                    {row.title}
                  </h3>

                  <div className="mt-4 flex flex-col w-full gap-x-4 gap-y-1 text-sm">
                    <div className="flex w-full justify-between">
                      <div className="text-zinc-500 w-fit">소재지</div>
                      <div>{row.location}</div>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="text-zinc-500">금액</div>
                      <div className="whitespace-nowrap">{row.price}</div>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="text-zinc-500">면적</div>
                      <div className="whitespace-nowrap">{row.area}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {!rows.length && <div className="mt-8 text-center text-zinc-500">조건에 해당하는 매물이 없습니다.</div>}
      </div>
    </section>
  );
}
