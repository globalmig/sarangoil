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
        <SwiperSlide className="bg-[url('/img/Main/hero_bg_1.jpg')] bg-cover bg-center bg-no-repeat">
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
    </>
  );
}
