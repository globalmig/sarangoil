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
  code?: string | number | null;
  // ✅ 태그용 컬럼 추가
  is_recommended?: boolean | null;
  is_urgent?: boolean | null;
};

export default async function Page() {
  const supabase = createSupabaseServer();

  // ✅ 섹션별 최신 10개씩 병렬 조회 - created_at 기준으로 내림차순 정렬
  const [allRes, leaseRes, saleRes] = await Promise.all([
    supabase
      .from("properties")
      .select("id, deal_type, property_type, features, price, deposit, monthly_rent, location, created_at, code, is_recommended, is_urgent")
      .eq("is_urgent", true)
      .order("id", { ascending: false })
      .limit(10),
    supabase
      .from("properties")
      .select("id, deal_type, property_type, features, price, deposit, monthly_rent, location, created_at, code, is_recommended, is_urgent")
      .eq("deal_type", "임대")
      .order("id", { ascending: false })
      .limit(10),
    supabase
      .from("properties")
      .select("id, deal_type, property_type, features, price, deposit, monthly_rent, location, created_at, code, is_recommended, is_urgent")
      .eq("deal_type", "매매")
      .order("id", { ascending: false })
      .limit(10),
  ]);

  // 에러 로깅 개선
  if (allRes.error) {
    console.error("properties(all) fetch error:", allRes.error);
    console.error("Query details:", { table: "properties", filter: "none", order: "created_at desc" });
  }
  if (leaseRes.error) {
    console.error("properties(lease) fetch error:", leaseRes.error);
    console.error("Query details:", { table: "properties", filter: "deal_type = 임대", order: "created_at desc" });
  }
  if (saleRes.error) {
    console.error("properties(sale) fetch error:", saleRes.error);
    console.error("Query details:", { table: "properties", filter: "deal_type = 매매", order: "created_at desc" });
  }

  const rows: Row[] = (allRes.data as Row[]) ?? [];
  const leaseRows: Row[] = (leaseRes.data as Row[]) ?? [];
  const saleRows: Row[] = (saleRes.data as Row[]) ?? [];

  // 디버깅을 위한 로그 추가
  console.log("Fetched data counts:", {
    all: rows.length,
    lease: leaseRows.length,
    sale: saleRows.length,
  });

  // 최신 데이터 확인 (ID 기준)
  if (rows.length > 0) {
    console.log("Latest item (highest ID):", {
      id: rows[0].id,
      created_at: rows[0].created_at,
      deal_type: rows[0].deal_type,
    });
  }

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
                const codeText = r.code ? String(r.code) : String(r.id).padStart(10, "0");

                // ✅ 상세 링크: 거래 타입에 따라 분기
                const base = r.deal_type === "임대" ? "/lease" : "/sale";
                const href = `${base}/${String(r.id)}`;

                return (
                  <tr key={r.id} className="bg-white">
                    <td className="px-4 py-2 border text-center hidden md:table-cell">{codeText}</td>
                    <td className="px-4 py-2 border">
                      <Link href={href} className="hover:text-lime-700 flex flex-col md:flex-row">
                        <div className="max-w-[800px]">{title}</div>

                        {/* ✅ 태그: 조건부 렌더 */}
                        <div className="flex items-center gap-2 ml-0 md:ml-4 h-fit">
                          {r.is_urgent ? (
                            <span className="inline-flex items-center rounded-sm bg-red-600 text-white px-2 py-0.5 text-xs font-semibold animate-blink animate-infinite">급매</span>
                          ) : null}
                          {r.is_recommended ? (
                            <span className="inline-flex items-center rounded-sm bg-lime-600 text-white px-2 py-0.5 text-xs font-semibold animate-blink animate-infinite">추천</span>
                          ) : null}
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
      <section className="md:h-[460px] h-64">
        <HeroSlider />
      </section>
      <div className="flex md:mt-20 my-10 max-w-[1200px]  mx-auto px-4">
        {/* ===== 메인 2열 그리드 ===== */}
        <div className="">
          <section className="md:grid md:grid-cols-[200px_1fr] md:auto-rows-min md:gap-6">
            {/* 1행 좌: 로고 패널 */}
            <aside className="rounded-lg border bg-white md:col-start-1 md:row-start-1 hidden md:block">
              <div className="px-4 py-3 border-b bg-black text-white rounded-t-lg">
                <h2 className="text-lg md:text-xl font-bold text-center">관련 사이트</h2>
              </div>
              <ul className="p-4 grid grid-cols-1 gap-8 place-items-center">
                <li>
                  <a href="https://efamily.scourt.go.kr/index.jsp" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                    <Image src="/img/OfficialLinks/iros.go.kr.png" alt="전자가족관계등록" width={140} height={140} />
                  </a>
                </li>
                <li>
                  <a href="https://www.consumer.go.kr/user/ftc/consumer/priceInfo/93/selectPriceInfoOilList.do" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                    <Image src="/img/OfficialLinks/소비자24.png" alt="소비자24" width={140} height={140} />
                  </a>
                </li>
                <li>
                  <a href="http://www.ikosa.or.kr/" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                    <Image src="/img/OfficialLinks/한국주유소협회.png" alt="한국주유소협회" width={150} height={150} />
                  </a>
                </li>
                <li>
                  <a href="https://www.opinet.co.kr/user/main/mainView.do" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                    <Image src="/img/OfficialLinks/오피넷.png" alt="오피넷" width={100} height={100} />
                  </a>
                </li>
                <li>
                  <a href="https://www.kpetro.or.kr/index.do" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                    <Image src="/img/OfficialLinks/한국석유관리원.png" alt="석유관리원" width={150} height={150} />
                  </a>
                </li>
                <li>
                  <a href="http://www.koreaoil.or.kr/" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                    <Image src="/img/OfficialLinks/한국석유유통협회.png" alt="한국석유유통협회" width={150} height={150} />
                  </a>
                </li>
                <li>
                  <a href="https://www.eum.go.kr/web/am/amMain.jsp" target="_blank" rel="noreferrer" className="block hover:opacity-80">
                    <Image src="/img/OfficialLinks/토지e음.png" alt="토지e음" width={140} height={140} />
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
                <li>
                  <a href="https://www.chabinu.com/" target="_blank" rel="noreferrer" className="block hover:opacity-80 rounded-md font-bold bg-black text-white py-4 px-10">
                    CHABINU
                  </a>
                </li>
              </ul>
            </aside>{" "}
          </section>
          <section className="mt-10 space-y-0 max-w-[200px]">
            <div className="px-4 py-3 border-b bg-black text-white rounded-t-lg">
              <h2 className="text-lg md:text-xl font-bold text-center">관련 양식</h2>
            </div>
            <a href="/doc/주유소위험물변경서류.zip" download="주유소 위험물 변경서류.zip" className="block px-4 py-3 border rounded-b-lg bg-gray-100 hover:bg-gray-200 text-center font-medium">
              주유소 위험물 변경서류 다운로드
            </a>
          </section>
        </div>
        <div className="flex flex-col gap-10">
          {/* 1행 우: 신규 게시판 */}
          <section className="rounded-lg bg-white md:col-start-2 md:row-start-1">
            <div className="py-3 flex items-end justify-between border-b bg-black text-white rounded-t-lg px-4 md:px-6">
              <h2 className="text-lg md:text-xl font-bold">New 급매물</h2>
              <Link href="/lease" className="hover:text-lime-400 font-semibold">
                전체보기 {">"}
              </Link>
            </div>
            <div className="">
              <RowsTable list={rows} />
            </div>
          </section>

          {/* 2행 우: 임대 */}
          <section className="rounded-lg bg-white md:col-start-2 md:row-start-2">
            <div className="py-3 flex items-end justify-between border-b bg-black text-white rounded-t-lg px-4 md:px-6">
              <h2 className="text-lg md:text-xl font-bold">주유소 임대 물건</h2>
              <Link href="/lease?category=gas-lease" className="hover:text-lime-400 font-semibold">
                전체보기 {">"}
              </Link>
            </div>
            <div className="">
              <RowsTable list={leaseRows} />
            </div>
          </section>

          {/* 3행 우: 매매 */}
          <section className="rounded-lg bg-white md:col-start-2 md:row-start-3">
            <div className="py-3 flex items-end justify-between border-b bg-black text-white rounded-t-lg px-4 md:px-6">
              <h2 className="text-lg md:text-xl font-bold">주유소 매매 물건</h2>
              <Link href="/sale?category=gas-station" className="hover:text-lime-400 font-semibold">
                전체보기 {">"}
              </Link>
            </div>
            <div className="">
              <RowsTable list={saleRows} />
            </div>
          </section>
        </div>
      </div>
      <div id="contact">
        <Contact />
      </div>
    </div>
  );
}
