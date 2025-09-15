"use client";
import React, { Suspense, useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "./styles/slider/style.css";

export default function App() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-500 ">Loading…</div>}>
      <Swiper
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide className="relative">
          {/* ✅ 배경 이미지 (lazy 로딩 지원) */}
          <Image
            src="/img/Main/hero_bg_1.jpg"
            alt="주유소 배경"
            fill
            priority={true} // 첫 배너는 priority={true}, 나머지는 false로 lazy 로딩
            className="object-cover object-center"
          />

          {/* ✅ 어두운 오버레이 */}
          <div className="absolute inset-0 bg-black/40" />

          {/* ✅ 내용 */}
          <div className="relative z-10 flex flex-col h-full items-center justify-center px-4 text-center">
            <h2 className="text-xl md:text-5xl font-bold mt-4 md:mt-0 text-white">
              주유소 임대 · 매매 · 부지
              <br />
              전문 부동산
            </h2>
            <a href="tel:0312455189" className="text-lime-300 font-bold text-xl md:text-4xl mt-4 md:mt-10">
              031-245-5189
            </a>
          </div>
        </SwiperSlide>
        <SwiperSlide className="bg-[url('/img/Main/hero_bg_2.jpg')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col h-full items-center justify-center px-4 text-center">
            <h2 className="text-xl md:text-5xl font-bold mt-4 md:mt-0 text-white">
              주유소 임대 · 매매 · 부지
              <br />
              전문 부동산
            </h2>
            <a href="tel:0312455189" className="text-lime-300 font-bold text-xl md:text-4xl mt-4 md:mt-10">
              031-245-5189
            </a>
          </div>
        </SwiperSlide>
        <SwiperSlide className="bg-[url('/img/Main/hero_bg_3.jpg')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 flex flex-col h-full items-center justify-center px-4 text-center">
            <h2 className="text-xl md:text-5xl font-bold mt-4 md:mt-0 text-white">
              주유소 임대 · 매매 · 부지
              <br />
              전문 부동산
            </h2>
            <a href="tel:0312455189" className="text-lime-300 font-bold text-xl md:text-4xl mt-4 md:mt-10">
              031-245-5189
            </a>
          </div>
        </SwiperSlide>
      </Swiper>
    </Suspense>
  );
}
