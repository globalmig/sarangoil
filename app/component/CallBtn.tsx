import React from "react";
import Image from "next/image";
import { IoCall } from "react-icons/io5";

export default function CallBtn() {
  return (
    <div className="rounded-full bg-lime-500 flex justify-center items-center fixed right-0 bottom-10 w-16 h-16 md:w-20 md:h-20 mx-4 z-50 shadow-md lg:hidden">
      <a className="PC hidden lg:block" href="tel:031-245-5189">
        <IoCall color="white" size={"30"} />
      </a>
      <a className="Mo block lg:hidden" href="tel:031-245-5189">
        <IoCall color="white" size={"24"} />
      </a>
    </div>
  );
}
