"use client";

import {
  AdminTable,
  Column,
  FieldConfig,
} from "@/components/admin/admin-table";
import { formatDate } from "@/lib/format";

const columns: Column[] = [
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
