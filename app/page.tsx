// app/page.tsx
export const dynamic = "force-dynamic";

import React from "react";
import HeroSlider from "./component/HeroSlider";
import Image from "next/image";
import Link from "next/link";
import Contact from "./component/Contact";
import { createSupabaseServer } from "@/app/supabase/server";

// function formatManwon(v: number | null | undefined) {
//   if (v == null) return "-";
//   const man = Math.round(v / 10000);
//   return `${man.toLocaleString("ko-KR")}`;
// }

const TYPE_LABEL: Record<string, string> = {
  gas_station: "주유소",
  gas_lease: "주유소",
  charging_station: "충전소",
  rest_area: "휴게소",
};

export default async function Page() {
  const supabase = createSupabaseServer();

  const { data: rows, error } = await supabase
    .from("properties")
    .select("id, deal_type, property_type, features, price, deposit, monthly_rent, location, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    // 개발 중 콘솔만 찍고, UI는 조용히 처리
    console.error("properties fetch error:", error);
  }

  return (
    <div>
      <section className="md:h-[600px] h-72">
        <HeroSlider />
      </section>

      <section className="OfficialLinks p-4 border hidden md:block">
        <ul className="flex justify-between items-center gap-4 max-w-[1440px] mx-auto">
          <li>
            <a href="https://www.molit.go.kr/portal.do" target="_blank">
              <Image src="/img/OfficialLinks/molit.go.kr.png" alt="국토교통부" width={120} height={120} />
            </a>
          </li>
          <li>
            <a href="https://www.nts.go.kr/" target="_blank">
              <Image src="/img/OfficialLinks/국세청.png" alt="국세청" width={90} height={100} />
            </a>
          </li>
          <li>
            <a href="https://www.iros.go.kr" target="_blank">
              <Image src="/img/OfficialLinks/iros.go.kr.png" alt="전자가족관계등록" width={140} height={140} />
            </a>
          </li>
          <li>
            <a href="https://www.lh.or.kr/intro.html" target="_blank">
              <Image src="/img/OfficialLinks/LH한국토지주택공사.png" alt="LH한국토지주택공사" width={120} height={120} />
            </a>
          </li>
        </ul>
      </section>

      <section className="Board max-w-[1440px] mx-auto px-4 my-10 md:my-20">
        <div className="group flex justify-between items-end mb-4">
          <h2 className="text-xl md:text-2xl font-bold">New 새로운 매물</h2>
          <Link href="/lease" className="hover:text-lime-600 font-bold">
            전체보기 {">"}
          </Link>
        </div>

        <div className="overflow-x-auto pb-10 w-full">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="px-4 py-2 border hidden md:table-cell">매물번호</th>
                <th className="px-4 py-2 border">특징</th>
                <th className="px-4 py-2 border">금액</th>
              </tr>
            </thead>
            <tbody>
              {rows && rows.length > 0 ? (
                rows.map((r) => {
                  const typeLabel = TYPE_LABEL[r.property_type as keyof typeof TYPE_LABEL] ?? r.property_type;
                  const badge = r.deal_type === "임대" ? "임" : "매";
                  const badgeClass = r.deal_type === "임대" ? "bg-red-400" : "bg-green-500";
                  const title = `[${typeLabel}${r.deal_type}] ${r.features ?? r.location ?? ""}`;

                  const href = `/lease/${String(r.id)}`;

                  return (
                    <tr key={r.id} className="bg-white">
                      <td className="px-4 py-2 border text-center hidden md:table-cell">{String(r.id).padStart(8, "0")}</td>
                      <Link href={href} className="hover:text-lime-700">
                        <td className="px-4 py-2 border flex flex-col md:flex-row">
                          {title}

                          <div className="bg-lime-400 text-lime-900 w-fit px-1 py-0.5 rounded-sm ml-0 md:ml-4">
                            <p className="animate-blink animate-infinite text-xs font-semibold">추천</p>
                          </div>
                        </td>
                      </Link>
                      <td className="px-4 py-2 border">
                        <div className="flex items-center gap-2">
                          <span className={`w-fit px-1 text-white rounded-sm ${badgeClass}`}>{badge}</span>
                          {r.deal_type === "임대" ? (
                            r.deposit || r.monthly_rent ? (
                              <>
                                {r.deposit ?? "-"} / {r.monthly_rent ?? "-"}
                              </>
                            ) : (
                              <>문의</>
                            )
                          ) : r.price ? (
                            <>{r.price}</>
                          ) : (
                            <>문의</>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-6 border text-center" colSpan={3}>
                    등록된 매물이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4  border-t-2 py-10">
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          <div className="text-wrap md:w-[30%] flex flex-col justify-between py-10">
            <p className="opacity-60">합리적인 가격</p>
            <p className="text-xl md:text-2xl font-bold mb-3 break-keep mt-2">
              실제 시장 가격을 반영하여,
              <br className="hidden md:block" /> 신뢰할 수 잇는 주유소 매매 및 임대를 제공합니다.
            </p>
            <Link href={"/lease?category=gas-lease"} className="text-lime-600 border-b-lime-600 border-b-2 flex justify-between w-28 p-2">
              <p>View More</p>
              <p>+</p>
            </Link>
          </div>
          <div className="img-wrap w-full md:w-[70%] aspect-[16/6] overflow-hidden relative">
            <Image src="/img/Company/item01.jpg" alt="주유소" fill className="object-cover rounded-md" />
          </div>
        </div>

        <div className="flex flex-col-reverse  md:flex-row gap-2 md:gap-6 my-12 md:my-40 ">
          <div className="img-wrap w-full md:w-[70%] aspect-[16/6] overflow-hidden relative">
            <Image src="/img/Company/item02.jpg" alt="주유소" fill className="object-cover rounded-md" />
          </div>
          <div className="text-wrap md:w-[30%] flex flex-col justify-between py-10">
            <p className="opacity-60">전문 컨설팅</p>
            <p className="text-xl md:text-2xl font-bold mb-3 break-keep mt-2">주유소 업계 전문가들의 고객의 상황에 맞는 최적의 상담을 제공합니다.</p>
            <Link href={"/#contact"} className="text-lime-600 border-b-lime-600 border-b-2 flex justify-between w-28 p-2">
              <p>문의하기</p>
              <p>+</p>
            </Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          <div className="text-wrap md:w-[30%] flex flex-col justify-between py-10">
            <p className="opacity-60">투명한 거래</p>
            <p className="text-xl md:text-2xl font-bold mb-3 break-keep mt-2">매물 정보부터 계약까지, 모든 과정에서 투명성을 보장합니다.</p>
            <Link href={"/#contact"} className="text-lime-600 border-b-lime-600 border-b-2 flex justify-between w-28 p-2">
              <p>문의하기</p>
              <p>+</p>
            </Link>
          </div>
          <div className="img-wrap w-full md:w-[70%] aspect-[16/6] overflow-hidden relative">
            <Image src="/img/Company/item03.jpg" alt="주유소" fill className="object-cover rounded-md" />
          </div>
        </div>
      </section>

      <div id="contact">
        <Contact />
      </div>
    </div>
  );
}
