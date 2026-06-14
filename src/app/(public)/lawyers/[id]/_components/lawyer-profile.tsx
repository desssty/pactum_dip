// src/app/(public)/lawyers/[id]/_components/lawyer-profile.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  User,
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Calendar,
} from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
  category: { id: string; name: string };
  avgRating: number | null;
  ratingsCount: number;
  completedCount: number;
};

type Lawyer = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  createdAt: string;
  avgRating: number | null;
  ratingsCount: number;
  totalCompleted: number;
  services: Service[];
};

export default function LawyerProfile({ lawyer }: { lawyer: Lawyer }) {
  const router = useRouter();

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(Number(price));

  const memberSince = new Date(lawyer.createdAt).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12">
      {/* Назад */}
      <Button
        variant="ghost"
        className="mb-4 gap-2 text-slate-600 hover:text-slate-900 sm:mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Назад
      </Button>

      {/* Профиль юриста */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* ── Левая колонка — инфо ── */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center p-5 text-center sm:p-8">
              {/* Аватар */}
              {lawyer.image ? (
                <Image
                  src={lawyer.image}
                  alt={lawyer.name}
                  width={120}
                  height={120}
                  className="size-20 rounded-full object-cover sm:size-28 lg:size-30"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full bg-[#1E2A44] text-white sm:size-28 lg:size-30">
                  <User className="size-10 sm:size-14" />
                </div>
              )}

              {/* Имя */}
              <h1 className="mt-4 text-xl font-bold sm:mt-6 sm:text-2xl">
                {lawyer.name}
              </h1>

              {/* Рейтинг */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:mt-3 sm:gap-2">
                {lawyer.avgRating ? (
                  <>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 sm:size-5 ${
                            i < Math.round(lawyer.avgRating!)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium sm:text-base">
                      {lawyer.avgRating}
                    </span>
                    <span className="text-xs text-slate-500 sm:text-sm">
                      ({lawyer.ratingsCount})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">Нет отзывов</span>
                )}
              </div>

              <Separator className="my-4 sm:my-6" />

              {/* Статистика */}
              <div className="w-full space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="size-4" />
                    <span>Услуг</span>
                  </div>
                  <span className="font-semibold">
                    {lawyer.services.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="size-4" />
                    <span>Выполнено</span>
                  </div>
                  <span className="font-semibold">{lawyer.totalCompleted}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="size-4" />
                    <span>На платформе с</span>
                  </div>
                  <span className="font-semibold">{memberSince}</span>
                </div>
              </div>

              {/* Описание */}
              {lawyer.bio && (
                <>
                  <Separator className="my-4 sm:my-6" />
                  <div className="w-full text-left">
                    <h3 className="mb-1.5 text-sm font-semibold sm:mb-2 sm:text-base">
                      О себе
                    </h3>
                    <p className="whitespace-pre-wrap text-xs text-slate-600 sm:text-sm">
                      {lawyer.bio}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Правая колонка — услуги ── */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
            Услуги{" "}
            <span className="text-slate-400">({lawyer.services.length})</span>
          </h2>

          {lawyer.services.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center sm:py-12">
                <Briefcase className="mx-auto size-10 text-slate-300 sm:size-12" />
                <h3 className="mt-3 text-base font-semibold sm:mt-4 sm:text-lg">
                  Услуг пока нет
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 sm:mt-2">
                  Юрист ещё не добавил услуги
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              {lawyer.services.map((service) => (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="h-full transition-all hover:border-[#1E2A44]/30 hover:shadow-md">
                    <CardContent className="flex h-full flex-col p-4 sm:p-6">
                      {/* Категория */}
                      <Badge
                        variant="secondary"
                        className="mb-2 w-fit text-xs sm:mb-3"
                      >
                        {service.category.name}
                      </Badge>

                      {/* Название */}
                      <h3 className="text-base font-semibold leading-snug sm:text-lg">
                        {service.title}
                      </h3>

                      {/* Описание */}
                      <p className="mt-1.5 line-clamp-3 flex-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
                        {service.description}
                      </p>

                      {/* Рейтинг и статистика */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
                        {service.avgRating ? (
                          <div className="flex items-center gap-1 text-xs sm:text-sm">
                            <Star className="size-3.5 fill-amber-400 text-amber-400 sm:size-4" />
                            <span className="font-medium">
                              {service.avgRating}
                            </span>
                            <span className="text-slate-400">
                              ({service.ratingsCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 sm:text-sm">
                            Нет отзывов
                          </span>
                        )}

                        {service.completedCount > 0 && (
                          <span className="text-xs text-slate-400 sm:text-sm">
                            • {service.completedCount} выполн.
                          </span>
                        )}
                      </div>

                      {/* Цена */}
                      <div className="mt-3 border-t pt-3 sm:mt-4 sm:pt-4">
                        <span className="text-lg font-bold text-[#1E2A44] sm:text-xl">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
