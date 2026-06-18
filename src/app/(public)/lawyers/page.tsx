import { Suspense } from "react";
import LawyersClient from "./lawyers-client";

export const dynamic = "force-dynamic";

export default function LawyersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-400">Загрузка...</div>
        </div>
      }
    >
      <LawyersClient />
    </Suspense>
  );
}
