// app/admin/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Search from "../component/Search";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";

type Row = {
  id: string;
  location: string;
  title: string;
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
  rest_area: "부지",
};

// function formatManwon(v: number | null | undefined) {
//   if (v == null) return "-";
//   const man = Math.round(v / 10000);
//   return `${man.toLocaleString("ko-KR")}만원`;
// }

// ✅ 클라이언트용 Supabase (환경변수 필요)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Page() {
  // ---- 관리자 비번 게이트 ---------------------------------------------------
  const [isPass, setPass] = useState(false);
  const [isWord, setWord] = useState("");
  const EXPECTED = process.env.NEXT_PUBLIC_PASSWORD ?? "";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isWord === EXPECTED) setPass(true);
    else alert("관리자 비밀번호를 입력해주세요");
  };

  // ---- 검색 파라미터 읽기 (클라이언트 전용) ---------------------------------
  const sp = useSearchParams();
  const { category, dealTypeParam, listingId } = useMemo(() => {
    const cat = (sp.get("category") ?? "").toLowerCase().replaceAll("-", "_");
    const deal = (sp.get("dealType") ?? "").toLowerCase(); // "lease" | "sale"
    const id = (sp.get("listingId") ?? "").trim().toLowerCase();
    return { category: cat, dealTypeParam: deal, listingId: id };
  }, [sp]);

  // 카테고리 → DB 필터 맵 (property_type은 언더스코어 코드만 허용)
  const { propertyTypeFilter, dealTypeFromCategory } = useMemo(() => {
    // ✅ 주유소 임대: property_type + deal_type 모두 필터
    if (category === "gas_lease") {
      return { propertyTypeFilter: "gas_lease", dealTypeFromCategory: "임대" as const };
    }
    // ✅ 주유소 매매: property_type + deal_type 모두 필터
    if (category === "gas_sale" || category === "gas_station") {
      return { propertyTypeFilter: "gas_station", dealTypeFromCategory: "매매" as const };
    }

    // ✅ 유형 전용 카테고리
    if (category === "charging_station") return { propertyTypeFilter: "charging_station", dealTypeFromCategory: undefined };
    if (category === "rest_area") return { propertyTypeFilter: "rest_area", dealTypeFromCategory: undefined };
    if (category === "site") return { propertyTypeFilter: "site", dealTypeFromCategory: undefined };

    return { propertyTypeFilter: undefined, dealTypeFromCategory: undefined };
  }, [category]);

  const dealTypeFilter = useMemo(() => {
    if (dealTypeParam === "lease") return "임대";
    if (dealTypeParam === "sale") return "매매";
    return undefined;
  }, [dealTypeParam]);

  // ---- 데이터 로드 ----------------------------------------------------------
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPass) return; // 비번 통과 후에만 로드
    (async () => {
      setLoading(true);

      let query = supabase
        .from("properties")
        .select("id, location, features, property_type, deal_type, price, deposit, monthly_rent, area, created_at")
        .order("created_at", { ascending: false, nullsFirst: false }) // ✅ 최신순 + NULL은 뒤로
        .order("id", { ascending: false })
        .limit(100);

      if (propertyTypeFilter) query = query.eq("property_type", propertyTypeFilter);
      if (dealTypeFromCategory) query = query.eq("deal_type", dealTypeFromCategory);
      if (dealTypeFilter) query = query.eq("deal_type", dealTypeFilter);

      // listingId가 숫자면 DB에서 = 비교
      const idNum = Number(listingId);
      const useEqId = listingId !== "" && !Number.isNaN(idNum);
      if (useEqId) query = query.eq("id", idNum);

      const { data, error } = await query;
      if (error) {
        console.error("properties fetch error:", error);
        setRows([]);
        setLoading(false);
        return;
      }

      let mapped: Row[] =
        (data ?? []).map((r: any) => {
          const typeKo = TYPE_LABEL[r.property_type as keyof typeof TYPE_LABEL] ?? r.property_type;
          const title = `[${typeKo}${r.deal_type}] ${r.features ?? ""}`.trim();
          const dealTypeShort: "임" | "매" = r.deal_type === "임대" ? "임" : "매";
          const priceText = r.deal_type === "임대" ? `${r.deposit} / ${r.monthly_rent}` : `${r.price}`;
          const areaText = typeof r.area === "number" ? `${r.area}㎡` : r.area ? `${r.area}㎡` : "-";
          const dateText = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "";

          return {
            id: String(r.id).padStart(8, "0"),
            location: r.location ?? "-",
            title,
            isRecommended: (r.features ?? "").includes("추천"),
            dealType: dealTypeShort,
            price: priceText,
            area: areaText,
            date: dateText,
          };
        }) ?? [];

      // 부분 검색(listingId가 숫자가 아니면 프론트에서 필터)
      if (!useEqId && listingId) {
        mapped = mapped.filter((row) => row.id.toLowerCase().includes(listingId));
      }

      setRows(mapped);
      setLoading(false);
    })();
  }, [isPass, propertyTypeFilter, dealTypeFromCategory, dealTypeFilter, listingId]);

  // ---- 렌더 -----------------------------------------------------------------
  if (!isPass) {
    return (
      <div className="mt-20 md:mt-40 px-4 w-full max-w-[1440px] mx-auto flex flex-col items-center justify-center">
        <h2 className="text-xl md:text-2xl font-bold my-5 md:my-10 text-center">관리자 페이지</h2>
        <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
          <label className="block text-sm">
            비밀번호
            <input
              type="password"
              value={isWord}
              onChange={(e) => setWord(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2"
              placeholder="관리자 비밀번호"
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="w-full rounded-md bg-zinc-900 text-white py-2">
            확인
          </button>
        </form>
      </div>
    );
  }

  async function apiDeleteProperty(id: number) {
    const res = await fetch(`/api/properties/${id}`, {
      method: "DELETE",
      // 캐시 남지 않게
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      // 서버에서 온 에러 메시지 있으면 보여주기
      let msg = `DELETE failed: ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) msg = body.error;
      } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  return (
    <div className="mt-20 md:mt-40 px-4 mx-auto">
      <section className="my-10 w-full">
        <div className="max-w-[1440px] w-full mx-auto">
          <h2 className="text-xl md:text-2xl font-bold my-5 md:my-10 text-center">관리자 페이지</h2>
          <Search />
          <div className="max-w-[1440px] w-full flex justify-end my-4 items-center mx-auto">
            <Link href="/manager/write" className="px-6 py-3 bg-zinc-800 text-white rounded-md font-semibold">
              작성하기
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 ">
            <table className="hidden md:table w-full border-collapse text-sm">
              <thead className="bg-zinc-50 sticky top-0 z-10">
                <tr className="text-center text-zinc-600">
                  <th className="px-4 py-3 border">매물번호</th>
                  <th className="px-4 py-3 border">소재지</th>
                  <th className="px-4 py-3 border text-left">매물특징</th>
                  <th className="px-4 py-3 border">금액</th>
                  <th className="px-4 py-3 border">면적</th>
                  <th className="px-4 py-3 border">날짜</th>
                  <th className="px-4 py-3 border">수정</th>
                  <th className="px-4 py-3 border">삭제</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="bg-white hover:bg-zinc-50">
                    <td className="px-4 py-3 border text-center whitespace-nowrap align-middle">{row.id}</td>
                    <td className="px-4 py-3 border align-middle">{row.location}</td>
                    <td className="px-4 py-3 border align-middle">
                      <div className="flex items-center gap-2">
                        {row.isRecommended && <span className="inline-flex items-center rounded-sm bg-lime-500/90 text-white text-[11px] font-semibold px-2 py-0.5 animate-blink">추천</span>}
                        <span className="break-keep">{row.title}</span>
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
                    <td className="px-4 py-3 border text-center whitespace-nowrap align-middle">
                      <Link href={`/manager/edit/${Number(row.id)}`} aria-label={`매물 ${row.id} 수정`} className="inline-flex items-center justify-center p-2 hover:bg-zinc-50 rounded">
                        <FaRegEdit color="blue" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 border text-center whitespace-nowrap align-middle">
                      <button
                        onClick={async () => {
                          if (!confirm("정말 삭제하시겠어요?")) return;
                          try {
                            const idNum = Number(row.id); // ← 선언!
                            await apiDeleteProperty(idNum);
                            alert("삭제되었습니다.");
                            setRows((prev) => prev.filter((r) => Number(r.id) !== idNum));
                          } catch (e: any) {
                            alert(e.message ?? "삭제 중 오류가 발생했습니다.");
                          }
                        }}
                        className="px-2 py-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <FaRegTrashAlt color="red" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 모바일 카드 */}
            <ul className="md:hidden divide-y divide-zinc-200">
              {rows.map((row) => (
                <li key={row.id} className="bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{row.date}</span>
                    <span className={`inline-flex items-center rounded-sm text-white text-[11px] font-semibold px-1.5 py-0.5 ${row.dealType === "임" ? "bg-red-500" : "bg-blue-600"}`}>
                      {row.dealType}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">매물번호 {row.id}</div>

                  <h3 className="mt-2 font-medium break-keep">
                    {row.isRecommended && <span className="mr-2 inline-flex items-center rounded-sm bg-lime-500/90 text-white text-[11px] font-semibold p-2 animate-blink">추천</span>}
                    {row.title}
                  </h3>

                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="text-zinc-500">소재지</div>
                    <div>{row.location}</div>
                    <div className="text-zinc-500">금액</div>
                    <div className="whitespace-nowrap">{row.price}</div>
                    <div className="text-zinc-500">면적</div>
                    <div className="whitespace-nowrap">{row.area}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {!loading && !rows.length && <div className="mt-8 text-center text-zinc-500">조건에 해당하는 매물이 없습니다.</div>}
          {loading && <div className="mt-8 text-center text-zinc-500">불러오는 중…</div>}
        </div>
      </section>
    </div>
  );
}
