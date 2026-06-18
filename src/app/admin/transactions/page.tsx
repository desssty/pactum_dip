"use client";

import { AdminTable, Column } from "@/components/admin/admin-table";
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

export default function AdminTransactionsPage() {
  return (
    <AdminTable
      title="Банковские Транзакции"
      apiUrl="/api/admin/transactions"
      columns={columns}
      fields={[]}
      canCreate={false}
      canEdit={false}
    />
  );
}
