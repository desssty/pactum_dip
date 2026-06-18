"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Clock, CheckCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Booking = {
  id: string;
  status: "BOOKED" | "COMPLETED" | "CANCELED";
  paidAmount: number;
  serviceTitleSnapshot: string;
  slotStartSnapshot: string;
  slotEndSnapshot: string;
  client: { id: string; name: string; email: string; image: string | null };
  service: { id: string; title: string };
  rating: { value: number; comment: string | null } | null;
};

const STATUS_CONFIG = {
  BOOKED: { label: "Активно", className: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Завершено", className: "bg-green-100 text-green-800" },
  CANCELED: { label: "Отменено", className: "bg-red-100 text-red-800" },
};

function BookingCard({
  booking,
  onComplete,
  now,
}: {
  booking: Booking;
  onComplete?: (id: string) => void;
  now: Date;
}) {
  const cfg = STATUS_CONFIG[booking.status];
  const slotStart = parseISO(booking.slotStartSnapshot);
  const slotEnd = parseISO(booking.slotEndSnapshot);

  const canComplete =
    booking.status === "BOOKED" && now.getTime() >= slotEnd.getTime();

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          {/* Клиент */}
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#1E2A44] text-white text-xs">
              {booking.client.name[0]}
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {booking.client.name}
              </p>
              <p className="text-xs text-slate-500">{booking.client.email}</p>
            </div>
          </div>

          {/* Услуга */}
          <p className="mt-3 text-sm font-medium text-slate-700">
            {booking.serviceTitleSnapshot}
          </p>

          {/* Время */}
          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="size-3.5" />
            <span>
              {format(slotStart, "d MMMM, HH:mm", { locale: ru })}
              {" — "}
              {format(slotEnd, "HH:mm")}
            </span>
          </div>

          {/* Оценка */}
          {booking.rating && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-4",
                      i < booking.rating.value
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300",
                    )}
                  />
                ))}
                <span className="ml-1 text-sm text-slate-600">
                  {booking.rating.value}/5
                </span>
              </div>
              {booking.rating.comment && (
                <p className="mt-1 text-sm text-slate-600">
                  {booking.rating.comment}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <Badge className={cn("text-xs", cfg.className)}>{cfg.label}</Badge>

          <p className="font-semibold text-[#1E2A44]">
            {Number(booking.paidAmount).toLocaleString("ru-RU")} ₽
          </p>

          {booking.status === "BOOKED" && onComplete && (
            <div className="flex flex-col items-end gap-1">
              <Button
                size="sm"
                disabled={!canComplete}
                className="gap-1.5 bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 disabled:opacity-100"
                onClick={() => {
                  if (canComplete) onComplete(booking.id);
                }}
              >
                <CheckCircle className="size-4" />
                Завершить
              </Button>

              {!canComplete && (
                <p className="text-xs text-slate-500">
                  Доступно после {format(slotEnd, "HH:mm")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LawyerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("BOOKED");
  const [now, setNow] = useState(new Date());

  const fetchBookings = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lawyer/bookings?status=${status}`);
      const data = await res.json();
      setBookings(data);
    } catch {
      toast.error("Не удалось загрузить бронирования");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(tab);
  }, [tab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/lawyer/bookings/${id}/complete`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error(json.error, {
            description: "Обновите страницу, чтобы увидеть актуальный статус",
            duration: 5000,
          });
          fetchBookings(tab);
        } else {
          toast.error(json.error || "Ошибка");
        }
        return;
      }

      toast.success("Услуга отмечена как выполненная");
      fetchBookings(tab);
    } catch {
      toast.error("Ошибка сети");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Бронирования</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="BOOKED">Активные</TabsTrigger>
          <TabsTrigger value="COMPLETED">Завершённые</TabsTrigger>
          <TabsTrigger value="CANCELED">Отменённые</TabsTrigger>
        </TabsList>

        {["BOOKED", "COMPLETED", "CANCELED"].map((status) => (
          <TabsContent key={status} value={status}>
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                Загрузка...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center">
                <User className="mx-auto mb-4 size-10 text-slate-300" />
                <p className="text-slate-500">Нет бронирований</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    now={now}
                    onComplete={
                      status === "BOOKED" ? handleComplete : undefined
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
