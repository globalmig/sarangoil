import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <section className="min-h-64 bg-zinc-800 text-white/60 flex text-xs md:text-sm">
      <div className="max-w-[1440px] w-full flex flex-col justify-center items-center gap-4 px-4 mx-auto">
        <div className="flex flex-wrap gap-1 md:gap-4">
          <p>사랑공인중개사 사무소</p>
          <p>공인중개사: 윤태원</p>
          <p>사업자등록번호 : 135-32-28886</p>
          <p>등록번호 : 제41115-2022-00149</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <p>주소 : 경기도 수원시 팔달구 덕영대로 697번길7, 아트프라자122호(화서동)</p>
          <p>TEL : 031-245-5189</p>
          <p>FAX : 031-243-5189</p>
        </div>
        <Link href="/manager">관리자페이지</Link>
        <a href="https://m-mig.com/homepage-development" className="mt-4 md:mt-10 hover:text-lime-400">
          COPYRIGHT(c) 2025 사랑공인중개사 사무소. ALL RIGHTS RESERVED. Produced by GLOBALMIG
        </a>
      </div>
    </section>
  );
}
