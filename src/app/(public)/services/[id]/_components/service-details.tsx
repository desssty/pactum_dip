// src/app/(public)/services/[id]/_components/service-details.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Star,
  User,
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Slot = {
  id: string;
  startAt: string;
  endAt: string;
};

type Rating = {
  value: number;
  comment: string | null;
  createdAt: string;
  client: {
    id: string;
    name: string;
  };
};

type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  lawyer: {
    id: string;
    name: string;
    image: string | null;
    bio: string | null;
  };
  avgRating: number | null;
  ratingsCount: number;
  completedCount: number;
  slots: Slot[];
  ratings: Rating[];
};

export default function ServiceDetails({ service }: { service: Service }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<Slot[]>(service.slots);
  const [showAllSlots, setShowAllSlots] = useState(false);

  const isAuthenticated = status === "authenticated";
  const isClient = session?.user?.role === "CLIENT";
  const isLawyer = session?.user?.role === "LAWYER";
  const isUnauthorized = !isAuthenticated || isLawyer;

  useEffect(() => {
    setSlots(service.slots);
  }, [service.slots]);

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(Number(price));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "long",
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleBooking = async () => {
    if (!isClient) {
      router.push("/login");
      return;
    }

    if (!selectedSlot) {
      toast.error("Выберите время записи");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/client/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          slotId: selectedSlot,
        }),
      });

      if (res.status === 400) {
        const data = await res.json();

        if (data.code === "INSUFFICIENT_BALANCE") {
          toast.error(
            `Недостаточно средств! Нужно: ${data.details.requiredAmount} ₽, на балансе: ${data.details.currentBalance} ₽`,
          );
          return;
        }

        toast.error(data.error || "Ошибка бронирования");
        return;
      }

      if (!res.ok) {
        toast.error("Ошибка бронирования");
        return;
      }

      toast.success("Вы успешно записались!");
      setSelectedSlot(null);
      setSlots((prev) => prev.filter((slot) => slot.id !== selectedSlot));
      router.push("/client/bookings");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при записи");
    } finally {
      setLoading(false);
    }
  };

  // На мобилке показываем 3 слота, на десктопе — все в скролле
  const visibleSlots = showAllSlots ? slots : slots.slice(0, 3);

  // ─── Блок записи (переиспользуется и в сайдбаре, и внизу на мобилке) ───
  const bookingContent = (
    <div className="space-y-4">
      {/* Цена */}
      <div className="flex items-center justify-between">
        <span className="text-slate-600">Стоимость</span>
        <span className="text-xl font-bold text-[#1E2A44] sm:text-2xl">
          {formatPrice(service.price)}
        </span>
      </div>

      {/* Доступные слоты */}
      <div>
        <h3 className="mb-3 font-medium">Доступное время</h3>
        {slots.length === 0 ? (
          <p className="text-sm text-slate-500">
            Нет доступных слотов для записи
          </p>
        ) : (
          <>
            {/* Мобилка: показываем ограниченное кол-во + кнопку «Ещё» */}
            <div className="space-y-2 lg:hidden">
              {visibleSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => isClient && setSelectedSlot(slot.id)}
                  disabled={isUnauthorized}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedSlot === slot.id
                      ? "border-[#1E2A44] bg-[#1E2A44]/5"
                      : isUnauthorized
                        ? "cursor-not-allowed opacity-60"
                        : "hover:border-[#1E2A44]/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-[#1E2A44]" />
                    <span className="text-sm font-medium">
                      {formatDate(slot.startAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="size-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {formatTime(slot.startAt)} — {formatTime(slot.endAt)}
                    </span>
                  </div>
                </button>
              ))}

              {slots.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllSlots(!showAllSlots)}
                  className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium text-[#1E2A44] transition-colors hover:bg-slate-50"
                >
                  {showAllSlots ? (
                    <>
                      Свернуть <ChevronUp className="size-4" />
                    </>
                  ) : (
                    <>
                      Ещё {slots.length - 3} слотов{" "}
                      <ChevronDown className="size-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Десктоп: все слоты в скролле */}
            <div className="hidden max-h-60 space-y-2 overflow-y-auto lg:block">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => isClient && setSelectedSlot(slot.id)}
                  disabled={isUnauthorized}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedSlot === slot.id
                      ? "border-[#1E2A44] bg-[#1E2A44]/5"
                      : isUnauthorized
                        ? "cursor-not-allowed opacity-60"
                        : "hover:border-[#1E2A44]/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-[#1E2A44]" />
                    <span className="text-sm font-medium">
                      {formatDate(slot.startAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="size-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {formatTime(slot.startAt)} — {formatTime(slot.endAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Кнопка записи */}
      {isUnauthorized ? (
        <div className="space-y-3">
          {isLawyer ? (
            <p className="text-center text-sm text-slate-500">
              Юристы не могут записываться на услуги
            </p>
          ) : (
            <Button
              className="w-full bg-[#1E2A44] hover:bg-[#162033]"
              onClick={() => router.push("/login")}
            >
              Войти для записи
            </Button>
          )}
        </div>
      ) : (
        <Button
          className="w-full bg-[#1E2A44] hover:bg-[#162033]"
          disabled={!selectedSlot || loading}
          onClick={handleBooking}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Записаться"}
        </Button>
      )}

      {isClient && (
        <p className="text-center text-xs text-slate-500 sm:text-sm">
          Выберите удобное время и нажмите «Записаться». Средства будут списаны
          с вашего баланса.
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12">
      {/* Кнопка назад */}
      <Button
        variant="ghost"
        className="mb-4 gap-2 text-slate-600 hover:text-slate-900 sm:mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Назад
      </Button>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
        {/* ── Основная информация ── */}
        <div className="space-y-6 sm:space-y-8 lg:col-span-2">
          {/* Хлебные крошки */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 sm:gap-2 sm:text-sm">
            <Link href="/catalog" className="hover:text-[#1E2A44]">
              Каталог
            </Link>
            <span>/</span>
            <Link
              href={`/catalog?category=${service.category.id}`}
              className="hover:text-[#1E2A44]"
            >
              {service.category.name}
            </Link>
            <span>/</span>
            <span className="truncate text-slate-900">{service.title}</span>
          </div>

          {/* Название и цена */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Badge variant="secondary" className="mb-2 sm:mb-3">
                {service.category.name}
              </Badge>
              {/* Цена видна на мобилке тоже */}
              <span className="text-xl font-bold text-[#1E2A44] sm:text-2xl">
                {formatPrice(service.price)}
              </span>
            </div>

            <h1 className="text-2xl font-bold leading-tight sm:text-4xl">
              {service.title}
            </h1>

            {/* Рейтинг */}
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
              {service.avgRating ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 sm:size-5 ${
                          i < Math.round(service.avgRating!)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-base font-medium sm:text-lg">
                    {service.avgRating}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({service.ratingsCount} отзывов)
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-500">Нет отзывов</span>
              )}

              {service.completedCount > 0 && (
                <span className="text-xs text-slate-500 sm:text-sm">
                  • {service.completedCount} выполнено
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Описание */}
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">Описание</h2>
            <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700 sm:mt-4 sm:text-base">
              {service.description}
            </div>
          </div>

          <Separator />

          {/* Юрист */}
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">Юрист</h2>
            <Link
              href={`/lawyers/${service.lawyer.id}`}
              className="group mt-3 flex items-center gap-3 sm:mt-4 sm:gap-4"
            >
              {service.lawyer.image ? (
                <Image
                  src={service.lawyer.image}
                  alt={service.lawyer.name}
                  width={64}
                  height={64}
                  className="size-12 rounded-full object-cover sm:size-16"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-[#1E2A44] text-white sm:size-16">
                  <User className="size-6 sm:size-8" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold group-hover:text-[#1E2A44] sm:text-lg">
                  {service.lawyer.name}
                </h3>
                {service.lawyer.bio && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
                    {service.lawyer.bio}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* ── Блок записи — мобилка (показывается вместо сайдбара) ── */}
          <div className="lg:hidden">
            <Separator />
            <div className="pt-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="mb-4 text-lg font-semibold sm:text-xl">
                    Запись на услугу
                  </h2>
                  {bookingContent}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Отзывы */}
          {service.ratings.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">Отзывы</h2>
                <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                  {service.ratings.map((rating, index) => (
                    <Card key={index}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-full bg-[#1E2A44] text-white sm:size-8">
                              <User className="size-3.5 sm:size-4" />
                            </div>
                            <span className="text-sm font-medium sm:text-base">
                              {rating.client.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3.5 sm:size-4 ${
                                  i < rating.value
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="mt-2 text-sm text-slate-600 sm:mt-3">
                            {rating.comment}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs text-slate-400 sm:mt-2 sm:text-sm">
                          {new Date(rating.createdAt).toLocaleDateString(
                            "ru-RU",
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Боковая панель — только десктоп ── */}
        <div className="hidden lg:block">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Запись на услугу</h2>
              {bookingContent}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
