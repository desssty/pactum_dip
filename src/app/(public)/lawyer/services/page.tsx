"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Pencil, Trash2, Star, Briefcase } from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: { id: string; name: string };
  activeBookings: number;
  avgRating: number | null;
  reviewCount: number;
};

export default function LawyerServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/lawyer/services${params}`);
      const data = await res.json();
      setServices(data);
    } catch {
      toast.error("Не удалось загрузить услуги");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchServices, 300);
    return () => clearTimeout(t);
  }, [fetchServices]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/lawyer/services/${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка удаления");
        return;
      }
      toast.success("Услуга удалена");
      setDeleteId(null);
      fetchServices();
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Мои услуги</h1>
        <Link href="/lawyer/services/new">
          <Button className="gap-2 bg-[#1E2A44] hover:bg-[#162033]">
            <Plus className="size-4" />
            Создать услугу
          </Button>
        </Link>
      </div>

      {/* Поиск */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Поиск услуг..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Список */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Загрузка...</div>
      ) : services.length === 0 ? (
        <div className="py-16 text-center">
          <Briefcase className="mx-auto mb-4 size-12 text-slate-300" />
          <p className="text-slate-500">
            {search ? "Ничего не найдено" : "У вас пока нет услуг"}
          </p>
          {!search && (
            <Link href="/lawyer/services/new">
              <Button
                className="mt-4 bg-[#1E2A44] hover:bg-[#162033]"
                size="sm"
              >
                Создать первую услугу
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {service.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {service.category.name}
                    </Badge>
                    {service.activeBookings > 0 && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {service.activeBookings} активных записей
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                    {service.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-semibold text-[#1E2A44]">
                      {Number(service.price).toLocaleString("ru-RU")} ₽
                    </span>
                    {service.avgRating !== null && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                        {service.avgRating.toFixed(1)}{" "}
                        <span className="text-slate-400">
                          ({service.reviewCount})
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link href={`/lawyer/services/${service.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Pencil className="size-4" />
                      Изменить
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setDeleteId(service.id)}
                    disabled={service.activeBookings > 0}
                    title={
                      service.activeBookings > 0
                        ? "Нельзя удалить: есть активные бронирования"
                        : "Удалить"
                    }
                  >
                    <Trash2 className="size-4" />
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Диалог удаления */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить услугу?</AlertDialogTitle>
            <AlertDialogDescription>
              Услуга будет скрыта с платформы. История бронирований сохранится.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
