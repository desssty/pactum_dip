"use client";

import {
  AdminTable,
  Column,
  FieldConfig,
} from "@/components/admin/admin-table";
import { formatDate } from "@/lib/format";

const columns: Column[] = [
  {
    key: "client",
    label: "Клиент",
    render: (val) => val?.name ?? "—",
  },
  {
    key: "service",
    label: "Услуга",
    render: (val) => val?.title ?? "—",
  },
  {
    key: "value",
    label: "Оценка",
    render: (val) => `${"★".repeat(val)}${"☆".repeat(5 - val)}`,
  },
  { key: "comment", label: "Комментарий" },
  {
    key: "createdAt",
    label: "Дата",
    render: (val) => formatDate(val),
  },
];

const fields: FieldConfig[] = [
  {
    key: "value",
    label: "Оценка (1-5)",
    type: "number",
  },
  {
    key: "comment",
    label: "Комментарий",
    type: "textarea",
  },
];

export default function AdminRatingsPage() {
  return (
    <AdminTable
      title="Отзывы"
      apiUrl="/api/admin/ratings"
      columns={columns}
      fields={fields}
      canCreate={false}
    />
  );
}
