"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Clock, User, Star, History, MessageSquare } from "lucide-react";

type Booking = {
  id: string;
  status: "COMPLETED" | "CANCELED";
  paidAmount: number;
  serviceTitleSnapshot: string;
  lawyerNameSnapshot: string;
  slotStartSnapshot: string;
  slotEndSnapshot: string;
  cancellationReason: string | null;
  service: {
    id: string;
    title: string;
    lawyer: { id: string; name: string; image: string | null };
  };
  rating: { id: string; value: number; comment: string | null } | null;
};

export default function ClientHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("COMPLETED");

  // Форма отзыва
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewValue, setReviewValue] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/client/bookings?status=${status}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(tab);
  }, [tab]);

  const handleReview = async () => {
    if (!reviewBookingId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/client/reviews/${reviewBookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: reviewValue,
          comment: reviewComment.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка");
        return;
      }

      toast.success("Отзыв оставлен!");
      setReviewBookingId(null);
      setReviewComment("");
      setReviewValue(5);
      fetchBookings(tab);
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">История</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="COMPLETED">Завершённые</TabsTrigger>
          <TabsTrigger value="CANCELED">Отменённые</TabsTrigger>
        </TabsList>

        {["COMPLETED", "CANCELED"].map((status) => (
          <TabsContent key={status} value={status}>
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                Загрузка...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center">
                <History className="mx-auto mb-4 size-12 text-slate-300" />
                <p className="text-slate-500">Нет записей</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-2xl border bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {b.serviceTitleSnapshot}
                          </h3>
                          <Badge
                            className={cn(
                              "text-xs",
                              b.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800",
                            )}
                          >
                            {b.status === "COMPLETED"
                              ? "Завершена"
                              : "Отменена"}
                          </Badge>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                          <User className="size-3.5" />
                          {b.lawyerNameSnapshot}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="size-3.5" />
                          {format(
                            new Date(b.slotStartSnapshot),
                            "d MMMM yyyy, HH:mm",
                            { locale: ru },
                          )}
                          {" — "}
                          {format(new Date(b.slotEndSnapshot), "HH:mm")}
                        </div>

                        <p className="mt-2 text-sm font-semibold text-[#1E2A44]">
                          {b.paidAmount.toLocaleString("ru-RU")} ₽
                        </p>

                        {/* Причина отмены */}
                        {b.cancellationReason && (
                          <p className="mt-2 text-sm text-slate-500">
                            Причина: {b.cancellationReason}
                          </p>
                        )}

                        {/* Существующий отзыв */}
                        {b.rating && (
                          <div className="mt-3 rounded-xl bg-slate-50 p-3">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "size-4",
                                    i < b.rating!.value
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-300",
                                  )}
                                />
                              ))}
                            </div>
                            {b.rating.comment && (
                              <p className="mt-1 text-sm text-slate-600">
                                {b.rating.comment}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Кнопка отзыва */}
                      {b.status === "COMPLETED" && !b.rating && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setReviewBookingId(b.id);
                            setReviewValue(5);
                            setReviewComment("");
                          }}
                        >
                          <MessageSquare className="size-4" />
                          Оставить отзыв
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Диалог отзыва */}
      <Dialog
        open={reviewBookingId !== null}
        onOpenChange={(open) => {
          if (!open) setReviewBookingId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Оставить отзыв</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Звёзды */}
            <div className="space-y-2">
              <Label>Оценка</Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewValue(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "size-8",
                        i < reviewValue
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Комментарий */}
            <div className="space-y-2">
              <Label>Комментарий (необязательно)</Label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Расскажите о вашем опыте..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewBookingId(null)}
              >
                Отмена
              </Button>
              <Button
                onClick={handleReview}
                disabled={submitting}
                className="bg-[#1E2A44] hover:bg-[#162033]"
              >
                {submitting ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
