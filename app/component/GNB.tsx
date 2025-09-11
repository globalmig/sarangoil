"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { usePathname } from "next/navigation";
import Image from "next/image";
export default function GNB() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // 라우트가 바뀌면 모바일 메뉴 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 모바일 메뉴 열릴 때 바디 스크롤 잠그기
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav className={["fixed inset-x-0 top-0 z-50", isHome ? "text-white" : "bg-zinc-800 text-white"].join(" ")}>
        <div className="mx-auto max-w-[1440px] px-4">
          {/* 상단 바 */}
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Link href="/" className={`text-xl font-bold lg:text-base`}>
              <Image src="/img/logo.png" alt="모든주유소 로고" width={"140"} height={"140"} className="max-h-[30px]" />
            </Link>

            {/* 데스크톱 메뉴 */}
            <ul className="hidden lg:flex items-center gap-8 font-bold">
              <li>
                <Link href="/lease?dealType=lease">주유소 임대</Link>
              </li>
              <li>
                <Link href="/sale?dealType=sale">주유소 매매</Link>
              </li>
              <li>
                <Link href="/lands?category=rest-area">주유소 부지</Link>
              </li>
              <li>
                <Link href="/charging?category=charging-station">주유소 충전소</Link>
              </li>
              <li>
                <Link href="/manager" className="text-lime-300">
                  관리자페이지
                </Link>
              </li>
            </ul>

            {/* 모바일 버튼 */}
            <button onClick={() => setOpen((v) => !v)} aria-label={open ? "close menu" : "open menu"} aria-expanded={open} aria-controls="mo-menu" className="lg:hidden p-2">
              {open ? <IoClose size={24} /> : <GiHamburgerMenu size={22} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 패널 */}
        <div id="mo-menu" className={["lg:hidden overflow-hidden transition-[max-height] duration-300", open ? "max-h-[480px]" : "max-h-0"].join(" ")}>
          <ul className="bg-white text-black shadow-md font-semibold divide-y">
            <li>
              <Link href="/lease?category=gas-lease&dealType=lease" className="block px-4 py-4" onClick={() => setOpen(false)}>
                주유소 임대
              </Link>
            </li>
            <li>
              <Link href="/sale?dealType=sale" className="block px-4 py-4" onClick={() => setOpen(false)}>
                주유소 매매
              </Link>
            </li>
            <li>
              <Link href="/lands?category=rest-area" className="block px-4 py-4" onClick={() => setOpen(false)}>
                주유소 부지
              </Link>
            </li>
            <li>
              <Link href="/charging?category=charging-station" className="block px-4 py-4" onClick={() => setOpen(false)}>
                주유소 충전소
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 모바일 오버레이 (메뉴 열렸을 때 배경 클릭으로 닫기) */}
      <div
        className={["fixed inset-0 z-40 lg:hidden transition-opacity", open ? "opacity-100 bg-black/30" : "opacity-0 pointer-events-none"].join(" ")}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
