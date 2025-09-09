// app/page.tsx
export const dynamic = "force-dynamic";

import React from "react";
import HeroSlider from "./component/HeroSlider";
import Image from "next/image";
import Link from "next/link";
import Contact from "./component/Contact";
import { createSupabaseServer } from "@/app/supabase/server";
import GoogleMap from "./component/GoogleMap";

const TYPE_LABEL: Record<string, string> = {
  gas_station: "주유소",
  gas_lease: "주유소",
  charging_station: "충전소",
  rest_area: "휴게소",
};

type Row = {
  id: string | number;
  deal_type: "임대" | "매매";
  property_type: keyof typeof TYPE_LABEL | string;
  features?: string | null;
  price?: string | number | null;
  deposit?: string | number | null;
  monthly_rent?: string | number | null;
  location?: string | null;
  created_at?: string;
};

export default async function Page() {
  const supabase = createSupabaseServer();

  // ✅ 섹션별 최신 10개씩 병렬 조회
  const [allRes, leaseRes, saleRes] = await Promise.all([
    supabase.from("properties").select("id, deal_type, property_type, features, price, deposit, monthly_rent, location, created_at").order("created_at", { ascending: false }).limit(10),
    supabase
      .from("properties")
      .select("id, deal_type, property_type, features, price, deposit, monthly_rent, location, created_at")
      .eq("deal_type", "임대")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("properties")
      .select("id, deal_type, property_type, features, price, deposit, monthly_rent, location, created_at")
      .eq("deal_type", "매매")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (allRes.error) console.error("properties(all) fetch error:", allRes.error);
  if (leaseRes.error) console.error("properties(lease) fetch error:", leaseRes.error);
  if (saleRes.error) console.error("properties(sale) fetch error:", saleRes.error);

  const rows: Row[] = (allRes.data as Row[]) ?? [];
  const leaseRows: Row[] = (leaseRes.data as Row[]) ?? [];
  const saleRows: Row[] = (saleRes.data as Row[]) ?? [];

  // ✅ 공통 테이블 렌더러
  function RowsTable({ list }: { list: Row[] }) {
    return (
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
            {list.length > 0 ? (
              list.map((r) => {
                const typeLabel = TYPE_LABEL[r.property_type as keyof typeof TYPE_LABEL] ?? r.property_type;
                const badge = r.deal_type === "임대" ? "임" : "매";
                const badgeClass = r.deal_type === "임대" ? "bg-red-400" : "bg-green-500";
                const title = `[${typeLabel}${r.deal_type}] ${r.features ?? r.location ?? ""}`;

                // ✅ 상세 링크: 거래 타입에 따라 분기
                const base = r.deal_type === "임대" ? "/lease" : "/sale";
                const href = `${base}/${String(r.id)}`;

                return (
                  <tr key={r.id} className="bg-white">
                    <td className="px-4 py-2 border text-center hidden md:table-cell">{String(r.id).padStart(8, "0")}</td>

                    <td className="px-4 py-2 border">
                      <Link href={href} className="hover:text-lime-700 flex flex-col md:flex-row">
                        {title}
                        <div className="bg-lime-400 text-lime-900 w-fit px-1 py-0.5 rounded-sm ml-0 md:ml-4">
                          <p className="animate-blink animate-infinite text-xs font-semibold">추천</p>
                        </div>
                      </Link>
                    </td>

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
    );
  }

  return (
    <div>
      {/* 히어로 */}
      <section className="md:h-[600px] h-72">
        <HeroSlider />
      </section>
      {/* ===== 메인 2열 그리드 ===== */}
      <section
        className="max-w-[1440px] mx-auto px-4 md:mt-20 my-10
                    md:grid md:grid-cols-[280px_1fr] md:auto-rows-min md:gap-6"
      >
        {/* 1행 좌: 로고 패널 */}
        <aside className="rounded-lg border bg-white md:col-start-1 md:row-start-1 hidden md:block">
          <div className="px-4 py-3 border-b bg-black text-white rounded-t-lg">
            <h2 className="text-lg md:text-xl font-bold text-center">관련 사이트</h2>
          </div>
          <ul className="p-4 grid grid-cols-1 gap-10 place-items-center">
            <li>
              <a href="https://www.molit.go.kr/portal.do" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                <Image src="/img/OfficialLinks/molit.go.kr.png" alt="국토교통부" width={120} height={120} />
              </a>
            </li>
            <li>
              <a href="https://www.nts.go.kr/" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                <Image src="/img/OfficialLinks/국세청.png" alt="국세청" width={110} height={110} />
              </a>
            </li>
            <li>
              <a href="https://www.iros.go.kr" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                <Image src="/img/OfficialLinks/iros.go.kr.png" alt="전자등기" width={130} height={130} />
              </a>
            </li>
            <li>
              <a href="https://www.lh.or.kr/intro.html" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                <Image src="/img/OfficialLinks/LH한국토지주택공사.png" alt="LH 한국토지주택공사" width={120} height={120} />
              </a>
            </li>
            <li>
              <a href="https://www.eum.go.kr/web/am/amMain.jsp" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                <Image src="/img/OfficialLinks/토지이용규제정보서비스.png" alt="토지이용규제정보서비스" width={120} height={120} />
              </a>
            </li>
            <li>
              <a href="https://map.naver.com/" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                <Image src="/img/OfficialLinks/네이버지도.png" alt="네이버지도" width={120} height={120} />
              </a>
            </li>
            <li>
              <a href="https://map.kakao.com/" target="_blank" rel="noreferrer" className="block hover:opacity-80 rounded-md">
                <Image src="/img/OfficialLinks/카카오맵.png" alt="카카오맵" width={120} height={120} />
              </a>
            </li>
            {/* 필요하면 로고 추가 */}
          </ul>
        </aside>

        {/* 1행 우: 신규 게시판 */}
        <section className="rounded-lg bg-white md:col-start-2 md:row-start-1 ">
          <div className=" py-3 flex items-end justify-between border-b bg-black text-white rounded-t-lg px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-bold">New 새로운 매물</h2>
            <Link href="/lease" className="hover:text-lime-600 font-semibold">
              전체보기 {">"}
            </Link>
          </div>
          <div className="p-2 md:p-4">
            <RowsTable list={rows} />
          </div>
        </section>

        {/* 2행 우: 임대 (신규와 같은 라인에 정렬) */}
        <section className="rounded-lg  bg-white md:col-start-2 md:row-start-2 ">
          <div className=" py-3 flex items-end justify-between border-b bg-black text-white rounded-t-lg px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-bold">주유소 임대 매물</h2>
            <Link href="/lease?category=gas-lease" className="hover:text-lime-600 font-semibold">
              전체보기 {">"}
            </Link>
          </div>
          <div className="p-2 md:p-4">
            <RowsTable list={leaseRows} />
          </div>
        </section>

        {/* 3행 우: 매매 (신규와 같은 라인에 정렬) */}
        <section className="rounded-lg bg-white md:col-start-2 md:row-start-3 ">
          <div className=" py-3 flex items-end justify-between border-b bg-black text-white rounded-t-lg px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-bold">주유소 매매 매물</h2>
            <Link href="/sale?category=gas-station" className="hover:text-lime-600 font-semibold">
              전체보기 {">"}
            </Link>
          </div>
          <div className="p-2 md:p-4">
            <RowsTable list={saleRows} />
          </div>
        </section>
      </section>

      {/* 하단 섹션/문의 */}
      {/* <section className="max-w-[1440px] mx-auto px-4 border-t-2 py-10 md:py-20"> */}
      {/* 첫 줄
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          <div className="text-wrap md:w-[30%] flex flex-col justify-between py-10">
            <p className="opacity-60">합리적인 가격</p>
            <p className="text-xl md:text-2xl font-bold mb-3 break-keep mt-2">
              실제 시장 가격을 반영하여,
              <br className="hidden md:block" /> 신뢰할 수 있는 주유소 매매 및 임대를 제공합니다.
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

        {/* 둘째 줄 */}
      {/* <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-6 my-12 md:my-40">
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
        </div> */}

      {/* 셋째 줄 */}
      {/* <div className="flex flex-col md:flex-row gap-2 md:gap-6">
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
        </div>*/}
      {/* </section> */}

      {/* <section className="Map max-w-[1440px] w-full flex flex-col mx-auto items-center px-4 py-10 border-t">
        <div className="flex text-center w-full mb-4">
          <h2 className="text-xl md:text-2xl font-bold">부동산 찾아오시는 길</h2>
        </div>
        <GoogleMap />
      </section> */}

      <div id="contact">
        <Contact />
      </div>
    </div>
  );
}
