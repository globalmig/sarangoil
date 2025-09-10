// app/components/SearchFilters.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type Category =
  // | "lease" // 주유소임대
  // | "sale" // 주유소매매
  | "charging-station" // 충전소
  | "rest-area"; // 부지

type DealType = "sale" | "lease"; // 매매 / 임대

// const CATEGORY_OPTIONS: { label: string; value: Category }[] = [
//   { label: "주유소 임대", value: "gas-lease" },
//   { label: "주유소 매매", value: "gas-station" },
//   { label: "충전소", value: "charging-station" },
//   { label: "부지매매", value: "rest-area" },
// ];

const CATEGORY_OPTIONS: { label: string; value: Category }[] = [
  { label: "충전소", value: "charging-station" },
  { label: "부지매매", value: "rest-area" },
];

const DEAL_OPTIONS: { label: string; value: DealType }[] = [
  { label: "매매", value: "sale" },
  { label: "임대", value: "lease" },
];

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // URL 초기값을 훅 상태에 반영
  const [category, setCategory] = useState<Category | "">((params.get("category") as Category) || "");
  const [dealType, setDealType] = useState<DealType | "">((params.get("dealType") as DealType) || "");
  const [listingId, setListingId] = useState<string>(params.get("listingId") || "");

  const buildQuery = useCallback(() => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (dealType) q.set("dealType", dealType);
    if (listingId.trim()) q.set("listingId", listingId.trim());
    return q.toString();
  }, [category, dealType, listingId]);

  const onSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const query = buildQuery();
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    },
    [buildQuery, pathname, router]
  );

  const onReset = useCallback(() => {
    setCategory("");
    setDealType("");
    setListingId("");
    router.push(pathname); // 쿼리 초기화
  }, [pathname, router]);

  const isSearchDisabled = useMemo(() => !category && !dealType && !listingId.trim(), [category, dealType, listingId]);

  return (
    <form onSubmit={onSearch} className="w-full bg-white shadow-sm rounded-xl p-4 md:p-10 flex flex-col gap-3 md:gap-4 border" aria-label="매물 검색">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ">
        {/* 카테고리 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">카테고리</span>
          <select
            className="border rounded-md px-3 py-4 focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-slate-100"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
          >
            <option value="">전체</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* 매물구분 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">매물 구분</span>
          <select
            className="border rounded-md px-3 py-4 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            value={dealType}
            onChange={(e) => setDealType(e.target.value as DealType | "")}
          >
            <option value="">전체</option>
            {DEAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* 매물번호 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">매물번호</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="예) 00000003"
            className="border rounded-md px-3 h-[53px] bg-slate-100 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
          />
        </label>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onReset} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">
          초기화
        </button>
        <button type="submit" disabled={isSearchDisabled} className="px-4 py-2 rounded-md bg-zinc-900 text-white disabled:opacity-40">
          검색
        </button>
      </div>
    </form>
  );
}
