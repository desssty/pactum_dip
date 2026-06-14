"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { User, Mail, Pencil, X, Upload, Loader2, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useSession } from "next-auth/react";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
});

type FormData = z.infer<typeof schema>;

type ProfileData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  balance: number;
  createdAt: string;
  _count: { clientBookings: number };
};

export default function ClientProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const { update } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { uploading, handleFileChange } = useAvatarUpload(async (url) => {
    try {
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (res.ok) {
        setAvatar(url);
        setUser((prev) => (prev ? { ...prev, image: url } : prev));

        // ← Вот здесь тоже нужно передать
        await update({ image: url });

        toast.success("Фото обновлено");
        router.refresh();
      } else {
        const json = await res.json().catch(() => null);
        toast.error(json?.error || "Ошибка сохранения фото");
      }
    } catch {
      toast.error("Ошибка сети");
    }
  });

  useEffect(() => {
    fetch("/api/client/profile")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setAvatar(data.image || "");
        reset({ name: data.name });
      })
      .catch(() => toast.error("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Ошибка");
        return;
      }

      toast.success("Профиль обновлён");
      setIsEditing(false);

      // Важно: передаём новые данные
      await update({
        name: data.name,
      });

      setUser((prev) => (prev ? { ...prev, name: data.name } : prev));
      router.refresh();
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Загрузка...</div>;
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Мой профиль</h1>

      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Аватар */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative size-24 overflow-hidden rounded-full bg-[#1E2A44]">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  unoptimized={avatar.startsWith("/uploads/")}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <User className="size-10 text-white" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="size-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 ${
                uploading ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Изменить фото
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Данные */}
          <div className="flex-1">
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="flex items-center gap-1 text-sm text-slate-500">
                      <Mail className="size-3.5" />
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Pencil className="size-4" />
                    Редактировать
                  </Button>
                </div>

                <p className="text-xs text-slate-400">
                  На платформе с{" "}
                  {format(new Date(user.createdAt), "LLLL yyyy", {
                    locale: ru,
                  })}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      reset({ name: user.name });
                      setIsEditing(false);
                    }}
                  >
                    <X className="mr-1.5 size-4" />
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="bg-[#1E2A44] hover:bg-[#162033]"
                  >
                    {saving ? "Сохранение..." : "Сохранить"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#1E2A44]/10">
              <BookOpen className="size-5 text-[#1E2A44]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{user._count.clientBookings}</p>
              <p className="text-sm text-slate-500">Активных записей</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-green-100">
              <span className="text-lg font-bold text-green-700">₽</span>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {user.balance.toLocaleString("ru-RU")}
              </p>
              <p className="text-sm text-slate-500">Баланс</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
