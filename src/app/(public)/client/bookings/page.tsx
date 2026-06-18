"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Clock, User, XCircle, BookOpen } from "lucide-react";

type Booking = {
  id: string;
  status: "BOOKED" | "COMPLETED" | "CANCELED";
  paidAmount: number;
  serviceTitleSnapshot: string;
  lawyerNameSnapshot: string;
  slotStartSnapshot: string;
  slotEndSnapshot: string;
  service: {
    id: string;
    title: string;
    lawyer: { id: string; name: string; image: string | null };
  };
  rating: { id: string; value: number; comment: string | null } | null;
};

const STATUS_CONFIG = {
  BOOKED: { label: "Активна", className: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Завершена", className: "bg-green-100 text-green-800" },
  CANCELED: { label: "Отменена", className: "bg-red-100 text-red-800" },
};

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);
  const [now, setNow] = useState(new Date());

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/bookings?status=BOOKED");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Не удалось загрузить записи");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = async () => {
    if (!cancelId) return;

    setCanceling(true);
    try {
      const res = await fetch(`/api/client/bookings/${cancelId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancelReason.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error(json.error, {
            description: "Обновите страницу, чтобы увидеть актуальный статус",
            duration: 5000,
          });
        } else {
          toast.error(json.error || "Ошибка отмены");
        }
        setCanceling(false);
        return;
      }

      toast.success("Запись отменена. Средства возвращены на баланс.");
      setCancelId(null);
      setCancelReason("");
      fetchBookings();
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Мои записи</h1>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Загрузка...</div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-4 size-12 text-slate-300" />
          <p className="text-slate-500">Активных записей нет</p>
          <p className="mt-1 text-sm text-slate-400">
            Перейдите в каталог для бронирования
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const cfg = STATUS_CONFIG[b.status];
            const startAt = parseISO(b.slotStartSnapshot);
            const hasStarted = now.getTime() >= startAt.getTime();

            return (
              <div
                key={b.id}
                className="rounded-2xl border bg-white p-5 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {b.serviceTitleSnapshot}
                      </h3>
                      <Badge className={cn("text-xs", cfg.className)}>
                        {cfg.label}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                      <User className="size-3.5" />
                      <span>Юрист: {b.lawyerNameSnapshot}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock className="size-3.5" />
                      <span>
                        {format(startAt, "d MMMM yyyy, HH:mm", {
                          locale: ru,
                        })}
                        {" — "}
                        {format(parseISO(b.slotEndSnapshot), "HH:mm")}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#1E2A44]">
                      {b.paidAmount.toLocaleString("ru-RU")} ₽
                    </p>

                    {hasStarted && (
                      <p className="mt-2 text-xs text-slate-500">
                        Отмена недоступна: услуга уже началась
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={hasStarted}
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
                    onClick={() => setCancelId(b.id)}
                  >
                    <XCircle className="size-4" />
                    Отменить
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={cancelId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelId(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Отменить запись?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Средства будут возвращены на ваш баланс.
            </p>

            <div className="space-y-2">
              <Label>Причина отмены (необязательно)</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Укажите причину..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelId(null);
                  setCancelReason("");
                }}
              >
                Не отменять
              </Button>
              <Button
                onClick={handleCancel}
                disabled={canceling}
                className="bg-red-600 hover:bg-red-700"
              >
                {canceling ? "Отмена..." : "Подтвердить отмену"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
