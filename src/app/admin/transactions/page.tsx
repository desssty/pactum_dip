"use client";

import {
  AdminTable,
  Column,
  FieldConfig,
} from "@/components/admin/admin-table";
import {
  formatDate,
  formatMoney,
  walletTypeName,
  walletStatusName,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const columns: Column[] = [
  {
    key: "user",
    label: "Пользователь",
    render: (val) => val?.name ?? "—",
  },
  {
    key: "type",
    label: "Тип",
    render: (val) => walletTypeName(val),
  },
  {
    key: "amount",
    label: "Сумма",
    render: (val) => formatMoney(val),
  },
  {
    key: "status",
    label: "Статус",
    render: (val) => {
      const variant =
        val === "COMPLETED"
          ? "default"
          : val === "PENDING"
            ? "secondary"
            : "destructive";
      return <Badge variant={variant}>{walletStatusName(val)}</Badge>;
    },
  },
  {
    key: "booking",
    label: "Бронирование",
    render: (val) => val?.serviceTitleSnapshot ?? "—",
  },
  { key: "description", label: "Описание" },
  {
    key: "createdAt",
    label: "Дата",
    render: (val) => formatDate(val),
  },
];

const fields: FieldConfig[] = [
  { key: "user", label: "Пользователь" },
  {
    key: "type",
    label: "Тип операции",
    type: "select",
    options: [
      { value: "DEPOSIT", label: "Пополнение" },
      { value: "WITHDRAWAL", label: "Вывод" },
      { value: "BOOKING_PAYMENT", label: "Оплата бронирования" },
      { value: "BOOKING_REFUND", label: "Возврат" },
      { value: "SERVICE_PAYOUT", label: "Выплата юристу" },
    ],
  },
  { key: "amount", label: "Сумма", type: "number" },
  {
    key: "status",
    label: "Статус",
    type: "select",
    options: [
      { value: "PENDING", label: "Ожидает" },
      { value: "COMPLETED", label: "Завершена" },
      { value: "CANCELED", label: "Отменена" },
      { value: "FAILED", label: "Ошибка" },
    ],
  },
  { key: "description", label: "Описание", type: "textarea" },
];

export default function AdminTransactionsPage() {
  return (
    <AdminTable
      title="Банковские Транзакции"
      apiUrl="/api/admin/transactions"
      columns={columns}
      fields={fields}
      canCreate={false}
      canEdit={true}
      canDelete={false}
    />
  );
}
