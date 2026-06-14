"use client";

import Image from "next/image";
import {
  AdminTable,
  Column,
  FieldConfig,
} from "@/components/admin/admin-table";
import { formatDate } from "@/lib/format";

const columns: Column[] = [
  {
    key: "imageUrl",
    label: "Фото",
    render: (val) =>
      val ? (
        <Image
          src={val}
          alt="Category"
          width={48}
          height={48}
          className="size-12 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
          Нет
        </div>
      ),
  },
  { key: "name", label: "Название" },
  { key: "description", label: "Описание" },
  {
    key: "_count",
    label: "Услуг",
    render: (val) => val?.services ?? 0,
  },
  {
    key: "createdAt",
    label: "Создана",
    render: (val) => formatDate(val),
  },
];

const fields: FieldConfig[] = [
  { key: "name", label: "Название", required: true },
  { key: "description", label: "Описание", type: "textarea", required: true },
  { key: "imageUrl", label: "Изображение", type: "image" },
];

export default function AdminCategoriesPage() {
  return (
    <AdminTable
      title="Категории"
      apiUrl="/api/admin/categories"
      columns={columns}
      fields={fields}
    />
  );
}
