"use client";

import {
  AdminTable,
  Column,
  FieldConfig,
} from "@/components/admin/admin-table";
import { formatDate, formatMoney, bookingStatusName } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const columns: Column[] = [
  {
    key: "client",
    label: "Клиент",
    render: (val) => val?.name ?? "—",
  },
  { key: "serviceTitleSnapshot", label: "Услуга" },
  { key: "lawyerNameSnapshot", label: "Юрист" },
  {
    key: "paidAmount",
    label: "Сумма",
    render: (val) => formatMoney(val),
  },
  {
    key: "status",
    label: "Статус",
    render: (val) => {
      const variant =
        val === "BOOKED"
          ? "default"
          : val === "COMPLETED"
            ? "secondary"
            : "destructive";
      return <Badge variant={variant}>{bookingStatusName(val)}</Badge>;
    },
  },
  {
    key: "slotStartSnapshot",
    label: "Дата записи",
    render: (val) => formatDate(val),
  },
  {
    key: "createdAt",
    label: "Создано",
    render: (val) => formatDate(val),
  },
];

const fields: FieldConfig[] = [
  {
    key: "status",
    label: "Статус",
    type: "select",
    options: [
      { value: "BOOKED", label: "Забронирован" },
      { value: "CANCELED", label: "Отменён" },
      { value: "COMPLETED", label: "Завершён" },
    ],
  },
  {
    key: "paidAmount",
    label: "Сумма (₽)",
    type: "number",
  },
  {
    key: "serviceTitleSnapshot",
    label: "Название услуги (snapshot)",
  },
  {
    key: "lawyerNameSnapshot",
    label: "Имя юриста (snapshot)",
  },
  {
    key: "categoryNameSnapshot",
    label: "Категория (snapshot)",
  },
  {
    key: "slotStartSnapshot",
    label: "Начало слота",
    type: "datetime-local",
  },
  {
    key: "slotEndSnapshot",
    label: "Конец слота",
    type: "datetime-local",
  },
  {
    key: "cancellationReason",
    label: "Причина отмены",
    type: "textarea",
  },
  {
    key: "lateCancellation",
    label: "Поздняя отмена",
    type: "select",
    options: [
      { value: "false", label: "Нет" },
      { value: "true", label: "Да" },
    ],
  },
];

export default function AdminBookingsPage() {
  return (
    <AdminTable
      title="Бронирования"
      apiUrl="/api/admin/bookings"
      columns={columns}
      fields={fields}
      canCreate={false}
    />
  );
}
