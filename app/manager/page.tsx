import React, { Suspense } from "react";
import AdminClient from "../component/AdminClient";

export const dynamic = "force-dynamic"; // 또는 export const revalidate = 0;

export default function page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-500">Loading…</div>}>
      <AdminClient />
    </Suspense>
  );
}
