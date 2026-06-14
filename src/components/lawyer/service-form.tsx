"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
  description: z.string().min(10, "Минимум 10 символов"),
  price: z.coerce.number().positive("Укажите корректную цену"),
  categoryId: z.string().min(1, "Выберите категорию"),
});

type FormData = z.infer<typeof schema>;

type Category = { id: string; name: string };

type Props = {
  serviceId?: string;
  defaultValues?: Partial<FormData>;
};

export function ServiceForm({ serviceId, defaultValues }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!serviceId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        // Защита: убеждаемся что data — массив
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Ожидался массив категорий, получено:", data);
          setCategories([]);
        }
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Устанавливаем дефолтное значение select после загрузки категорий
  useEffect(() => {
    if (defaultValues?.categoryId) {
      setValue("categoryId", defaultValues.categoryId);
    }
  }, [defaultValues?.categoryId, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/lawyer/services/${serviceId}`
        : "/api/lawyer/services";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка сохранения");
        return;
      }

      toast.success(isEditing ? "Услуга обновлена" : "Услуга создана");
      router.push("/lawyer/services");
      router.refresh();
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Название */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Название <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Юридическая консультация"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Описание */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Описание <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Подробно опишите услугу..."
          className="min-h-[120px]"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Цена + Категория */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">
            Цена (₽) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register("price")}
            placeholder="5000"
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Категория <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("categoryId") || ""}
            onValueChange={(v) => setValue("categoryId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId.message}</p>
          )}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#1E2A44] hover:bg-[#162033]"
        >
          {loading
            ? "Сохранение..."
            : isEditing
              ? "Сохранить изменения"
              : "Создать услугу"}
        </Button>
      </div>
    </form>
  );
}
