"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import {
  User,
  Briefcase,
  Calendar,
  Mail,
  Pencil,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  bio: z.string().max(1000, "Максимум 1000 символов").optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    bio: string | null;
    image: string | null;
    balance: number;
    createdAt: string;
    _count: { lawyerServices: number; lawyerSlots: number };
  };
};

export function LawyerProfileClient({ user }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(user.image || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Хук загрузки аватара
  const { uploading, handleFileChange } = useAvatarUpload(async (url) => {
    // После успешной загрузки файла — сохраняем URL в профиль
    try {
      const res = await fetch("/api/lawyer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (res.ok) {
        setAvatar(url);
        toast.success("Аватар обновлён");
        router.refresh();
      } else {
        const json = await res.json();
        toast.error(json.error || "Ошибка сохранения аватара");
      }
    } catch {
      toast.error("Ошибка сохранения аватара");
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      bio: user.bio || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/lawyer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка сохранения");
        return;
      }

      toast.success("Профиль обновлён");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Мой профиль</h1>

      {/* Карточка профиля */}
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
                  unoptimized={avatar.startsWith("/uploads/")}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <User className="size-10 text-white" />
                </div>
              )}

              {/* Оверлей при загрузке */}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="size-6 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* label вместо Button — избегаем button-in-button */}
            <label
              className={`
                inline-flex cursor-pointer items-center gap-2 rounded-md border 
                border-slate-200 bg-white px-3 py-1.5 text-sm font-medium 
                text-slate-700 shadow-sm transition-colors 
                hover:bg-slate-50 hover:text-slate-900
                ${uploading ? "cursor-not-allowed opacity-50" : ""}
              `}
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
                    <h2 className="text-xl font-semibold text-slate-900">
                      {user.name}
                    </h2>
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

                {user.bio ? (
                  <p className="text-slate-600">{user.bio}</p>
                ) : (
                  <p className="italic text-slate-400">Описание не заполнено</p>
                )}

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

                <div className="space-y-2">
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Расскажите о своём опыте и специализации..."
                    className="min-h-[100px]"
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      reset();
                      setIsEditing(false);
                    }}
                    disabled={savingProfile}
                  >
                    <X className="mr-1.5 size-4" />
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={savingProfile}
                    className="bg-[#1E2A44] hover:bg-[#162033]"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      "Сохранить"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#1E2A44]/10">
              <Briefcase className="size-5 text-[#1E2A44]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{user._count.lawyerServices}</p>
              <p className="text-sm text-slate-500">Активных услуг</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#1E2A44]/10">
              <Calendar className="size-5 text-[#1E2A44]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{user._count.lawyerSlots}</p>
              <p className="text-sm text-slate-500">Открытых слотов</p>
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
