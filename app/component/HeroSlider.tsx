"use client";
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "./styles/slider/style.css";

export default function App() {
  return (
    <>
      <Swiper
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide className="bg-[url('/img/Main/hero_bg01.webp')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-white">
              주유소 경력 20년 노하우
              <br /> 거품없이 합리적인 가격의 주유소만 취급합니다
            </h2>
          </div>
        </SwiperSlide>
        <SwiperSlide className="bg-[url('/img/Main/hero_bg02.webp')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-white">
              주유소 매매 및 임대 전문가
              <br /> 항시 대기중입니다.
            </h2>
          </div>
        </SwiperSlide>
        <SwiperSlide className="bg-[url('/img/Main/hero_bg03.webp')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 flex flex-col h-full items-center justify-center px-4 text-center">
            <h2 className="text-xl md:text-3xl font-bold mt-4 md:mt-0 text-white">
              더 이상 고민하지 말고
              <br /> 신뢰성있는 업체한테 문의하세요!
            </h2>
            <a href="tel:0312455189" className="text-lime-300 font-bold text-xl md:text-4xl mt-4 md:mt-10">
              031-245-5189
            </a>
          </div>
        </SwiperSlide>
      </Swiper>
    </>
  );
}
