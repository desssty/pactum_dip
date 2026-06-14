"use client";

import { useState, useEffect, useCallback } from "react";
import { format, isSameDay, parseISO, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Trash2, Plus, Clock, User, Lock } from "lucide-react";

type Slot = {
  id: string;
  startAt: string;
  endAt: string;
  status: "OPEN" | "BOOKED" | "BLOCKED";
  booking?: {
    id: string;
    status: string;
    client: { name: string; email: string };
    service: { title: string };
    paidAmount: number;
  } | null;
};

const DURATION_OPTIONS = [
  { value: "30", label: "30 минут" },
  { value: "45", label: "45 минут" },
  { value: "60", label: "1 час" },
  { value: "90", label: "1.5 часа" },
  { value: "120", label: "2 часа" },
];

const STATUS_CONFIG = {
  OPEN: {
    label: "Свободен",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  BOOKED: {
    label: "Занят",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  BLOCKED: {
    label: "Заблокирован",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const calendarStyles = `
  .slot-calendar {
    --rdp-accent-color: #1E2A44;
    --rdp-accent-background-color: #1E2A44;
    --rdp-day-height: 44px;
    --rdp-day-width: 44px;
    width: 100%;
  }

  /* Месяц на всю ширину */
  .slot-calendar .rdp-month {
    width: 100%;
  }

  /* ===== НАВИГАЦИЯ: стрелки в одну линию ===== */
  .slot-calendar .rdp-nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    position: absolute;
    right: 0;
    top: 0;
  }

  .slot-calendar .rdp-months {
    position: relative;
  }

  .slot-calendar .rdp-button_next,
  .slot-calendar .rdp-button_previous {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    transition: all 0.15s;
  }

  .slot-calendar .rdp-button_next:hover,
  .slot-calendar .rdp-button_previous:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .slot-calendar .rdp-chevron {
    fill: #1E2A44;
    width: 16px;
    height: 16px;
  }

  /* ===== Заголовок месяца ===== */
  .slot-calendar .rdp-month_caption {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    font-weight: 700;
    font-size: 1.05rem;
    color: #1e293b;
    text-transform: capitalize;
    height: 36px;
  }

  /* ===== Дни недели ===== */
  .slot-calendar .rdp-weekdays {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .slot-calendar .rdp-weekday {
    padding: 0.5rem 0;
    text-align: center;
  }

  /* ===== Сетка дней — квадратные ячейки ===== */
  .slot-calendar .rdp-weeks {
    width: 100%;
  }

  .slot-calendar .rdp-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .slot-calendar .rdp-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .slot-calendar .rdp-day {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .slot-calendar .rdp-day_button {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    font: inherit;
    color: inherit;
    transition: all 0.15s ease;
  }

  /* Ховер на доступные дни */
  .slot-calendar .rdp-day:not(.rdp-disabled):not(.rdp-selected) .rdp-day_button:hover {
    background: #f1f5f9;
  }

  /* ===== Выбранный день ===== */
  .slot-calendar .rdp-selected .rdp-day_button {
    background: #1E2A44 !important;
    color: white !important;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(30, 42, 68, 0.35);
  }

  /* ===== Сегодня (не выбранный) ===== */
  .slot-calendar .rdp-today:not(.rdp-selected) .rdp-day_button {
    border: 2px solid #1E2A44;
    font-weight: 700;
    color: #1E2A44;
  }

  /* ===== Заблокированные (прошедшие) дни ===== */
  .slot-calendar .rdp-disabled .rdp-day_button {
    color: #cbd5e1 !important;
    opacity: 0.4;
    cursor: not-allowed;
    text-decoration: line-through;
  }

  .slot-calendar .rdp-disabled {
    pointer-events: none;
  }

  /* ===== Дни вне текущего месяца ===== */
  .slot-calendar .rdp-outside .rdp-day_button {
    color: #e2e8f0;
  }
`;

export function SlotManager() {
  const today = startOfDay(new Date());

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [duration, setDuration] = useState("60");
  const [showForm, setShowForm] = useState(false);

  const isSelectedPast = isBefore(selectedDate, today);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date(selectedDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(selectedDate);
      to.setHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/lawyer/slots?from=${from.toISOString()}&to=${to.toISOString()}`,
      );
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Не удалось загрузить слоты");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleCreate = async () => {
    if (isSelectedPast) {
      toast.error("Нельзя создавать слоты на прошедшую дату");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/lawyer/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(selectedDate, "yyyy-MM-dd"),
          startTime,
          endTime,
          duration: Number(duration),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка создания слотов");
        return;
      }

      toast.success(`Создано слотов: ${json.created} из ${json.total}`);
      setShowForm(false);
      fetchSlots();
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/lawyer/slots/${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка удаления");
        return;
      }
      toast.success("Слот удалён");
      setDeleteId(null);
      fetchSlots();
    } catch {
      toast.error("Ошибка сети");
    }
  };

  const handleToggleBlock = async (slot: Slot) => {
    if (slot.status === "BOOKED") return;
    const newStatus = slot.status === "OPEN" ? "BLOCKED" : "OPEN";
    try {
      const res = await fetch(`/api/lawyer/slots/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error);
        return;
      }
      fetchSlots();
    } catch {
      toast.error("Ошибка сети");
    }
  };

  const slotsForDay = slots.filter((s) =>
    isSameDay(parseISO(s.startAt), selectedDate),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      {/* ======= Левая колонка — календарь ======= */}
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <style>{calendarStyles}</style>

          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            locale={ru}
            disabled={{ before: today }}
            className="slot-calendar"
            showOutsideDays={false}
          />
        </div>

        {/* Форма создания слотов */}
        <div className="rounded-2xl border bg-white p-4">
          {isSelectedPast ? (
            <p className="text-center text-sm text-slate-400 py-2">
              Нельзя добавлять слоты на прошедшие даты
            </p>
          ) : !showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full gap-2 bg-[#1E2A44] hover:bg-[#162033]"
            >
              <Plus className="size-4" />
              Добавить слоты на {format(selectedDate, "d MMMM", { locale: ru })}
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="font-medium text-slate-800">
                {format(selectedDate, "d MMMM yyyy, EEEE", { locale: ru })}
              </p>

              <div className="space-y-2">
                <Label>Начало рабочего дня</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Конец рабочего дня</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Длительность слота</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-[#1E2A44] hover:bg-[#162033]"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? "Создание..." : "Создать"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======= Правая колонка — список слотов ======= */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            {format(selectedDate, "EEEE, d MMMM", { locale: ru })}
          </h2>
          <span className="text-sm text-slate-500">
            {slotsForDay.length}{" "}
            {slotsForDay.length === 1
              ? "слот"
              : slotsForDay.length < 5
                ? "слота"
                : "слотов"}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Загрузка...</div>
        ) : slotsForDay.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="text-slate-500">Нет слотов на этот день</p>
            {!isSelectedPast && (
              <p className="mt-1 text-sm text-slate-400">
                Нажмите «Добавить слоты» чтобы создать расписание
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {slotsForDay.map((slot) => {
              const cfg = STATUS_CONFIG[slot.status];
              const slotInPast = isBefore(parseISO(slot.endAt), new Date());

              return (
                <div
                  key={slot.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 transition-colors",
                    slot.status === "BOOKED" && "bg-blue-50/50",
                    slotInPast && "opacity-50",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[52px]">
                      <p className="text-sm font-semibold">
                        {format(parseISO(slot.startAt), "HH:mm")}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(parseISO(slot.endAt), "HH:mm")}
                      </p>
                    </div>

                    <div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", cfg.className)}
                      >
                        {cfg.label}
                      </Badge>

                      {slot.booking && (
                        <div className="mt-1">
                          <p className="flex items-center gap-1 text-xs text-slate-600">
                            <User className="size-3" />
                            {slot.booking.client.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {slot.booking.service.title}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {slot.status !== "BOOKED" && !slotInPast && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBlock(slot)}
                        title={
                          slot.status === "OPEN"
                            ? "Заблокировать"
                            : "Разблокировать"
                        }
                      >
                        <Lock className="size-4 text-slate-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(slot.id)}
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </Button>
                    </div>
                  )}

                  {slotInPast && slot.status !== "BOOKED" && (
                    <span className="text-xs text-slate-400">Прошёл</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======= Диалог удаления ======= */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить слот?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
