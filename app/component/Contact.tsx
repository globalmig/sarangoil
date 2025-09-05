import React from "react";

export default function Contact() {
  return (
    <section className="group h-96  flex flex-col justify-center items-center  text-white px-4  bg-[url('/img/Contact/bg.jpg')] bg-cover bg-center bg-no-repeat">
      <p className="opacity-70 mb-5">문의하기</p>
      <h2 className="text-xl md:text-3xl group-hover:text-lime-400 text-center">
        <strong>20년 이상</strong>의 경험으로 <br />
        주유소 거래를 전문적으로 지원합니다
      </h2>

      <a href="tel: 0312455189" className="bg-lime-400 text-zinc-700 font-bold text-2xl px-20 py-4 rounded-full mt-10 shadow-md">
        상담문의 : 031-245-5189
      </a>
    </section>
  );
}
