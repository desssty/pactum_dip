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
  { key: "cancellationReason", label: "Причина отмены", type: "textarea" },
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
