// src/app/(public)/lawyers/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Star,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Lawyer = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  servicesCount: number;
  avgRating: number | null;
  ratingsCount: number;
};

type LawyersResponse = {
  lawyers: Lawyer[];
  total: number;
  page: number;
  totalPages: number;
};

export default function LawyersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || "1"));

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLawyers = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/lawyers?${params.toString()}`);
      const data: LawyersResponse = await res.json();

      setLawyers(data.lawyers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Ошибка загрузки юристов", error);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timeout = setTimeout(fetchLawyers, 300);
    return () => clearTimeout(timeout);
  }, [fetchLawyers]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    router.replace(`/lawyers${query ? `?${query}` : ""}`, { scroll: false });
  }, [search, page, router]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Заголовок */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-4xl font-bold">Наши юристы</h1>
          <p className="mt-2 text-slate-600">
            Найдите специалиста для решения вашей задачи
          </p>

          {/* Поиск */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Поиск юриста по имени..."
                className="h-11 pl-10 pr-10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Контент */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 text-sm text-slate-600">
          Найдено: <span className="font-semibold text-slate-900">{total}</span>{" "}
          {total === 1 ? "юрист" : total < 5 ? "юриста" : "юристов"}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-slate-400" />
          </div>
        ) : lawyers.length === 0 ? (
          <div className="rounded-2xl border bg-white py-20 text-center">
            <User className="mx-auto size-12 text-slate-300" />
            <h3 className="mt-4 text-xl font-semibold">Юристы не найдены</h3>
            <p className="mt-2 text-slate-600">Попробуйте изменить запрос</p>
            {search && (
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                Сбросить поиск
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {lawyers.map((lawyer) => (
                <Link key={lawyer.id} href={`/lawyers/${lawyer.id}`}>
                  <Card className="h-full transition-all hover:border-[#1E2A44]/30 hover:shadow-md">
                    <CardContent className="flex h-full flex-col items-center p-6 text-center">
                      {/* Аватар */}
                      {lawyer.image ? (
                        <Image
                          src={lawyer.image}
                          alt={lawyer.name}
                          width={80}
                          height={80}
                          className="size-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-20 items-center justify-center rounded-full bg-[#1E2A44] text-white">
                          <User className="size-10" />
                        </div>
                      )}

                      {/* Имя */}
                      <h3 className="mt-4 text-lg font-semibold">
                        {lawyer.name}
                      </h3>

                      {/* Описание */}
                      {lawyer.bio && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {lawyer.bio}
                        </p>
                      )}

                      {/* Статистика */}
                      <div className="mt-auto flex w-full items-center justify-center gap-4 border-t pt-4 mt-4">
                        {/* Рейтинг */}
                        {lawyer.avgRating ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">
                              {lawyer.avgRating}
                            </span>
                            <span className="text-slate-400">
                              ({lawyer.ratingsCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Нет отзывов
                          </span>
                        )}

                        {/* Количество услуг */}
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Briefcase className="size-4" />
                          <span>
                            {lawyer.servicesCount}{" "}
                            {lawyer.servicesCount === 1
                              ? "услуга"
                              : lawyer.servicesCount < 5
                                ? "услуги"
                                : "услуг"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .map((p, index, arr) => (
                    <span key={p} className="flex items-center">
                      {index > 0 && arr[index - 1] !== p - 1 && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                      <Button
                        variant={p === page ? "default" : "outline"}
                        className={
                          p === page ? "bg-[#1E2A44] hover:bg-[#162033]" : ""
                        }
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </span>
                  ))}

                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
