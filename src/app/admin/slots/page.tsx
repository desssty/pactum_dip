"use client";

import { useEffect, useState } from "react";
import {
  AdminTable,
  Column,
  FieldConfig,
} from "@/components/admin/admin-table";
import { formatDate, slotStatusName } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function AdminSlotsPage() {
  const [lawyers, setLawyers] = useState<{ value: string; label: string }[]>(
    [],
  );

  useEffect(() => {
    fetch("/api/admin/users?search=")
      .then((r) => r.json())
      .then((users: any[]) => {
        setLawyers(
          users
            .filter((u) => u.role === "LAWYER")
            .map((u) => ({ value: u.id, label: u.name })),
        );
      });
  }, []);

  const columns: Column[] = [
    {
      key: "lawyer",
      label: "Юрист",
      render: (val) => val?.name ?? "—",
    },
    {
      key: "startAt",
      label: "Начало",
      render: (val) => formatDate(val),
    },
    {
      key: "endAt",
      label: "Конец",
      render: (val) => formatDate(val),
    },
    {
      key: "status",
      label: "Статус",
      render: (val) => {
        const variant =
          val === "OPEN"
            ? "outline"
            : val === "BOOKED"
              ? "default"
              : "destructive";
        return <Badge variant={variant}>{slotStatusName(val)}</Badge>;
      },
    },
  ];

  const fields: FieldConfig[] = [
    {
      key: "lawyerId",
      label: "Юрист",
      type: "select",
      options: lawyers,
      required: true,
    },
    { key: "startAt", label: "Начало", type: "datetime-local", required: true },
    { key: "endAt", label: "Конец", type: "datetime-local", required: true },
    {
      key: "status",
      label: "Статус",
      type: "select",
      options: [
        { value: "OPEN", label: "Свободен" },
        { value: "BOOKED", label: "Забронирован" },
        { value: "BLOCKED", label: "Заблокирован" },
      ],
      defaultValue: "OPEN",
    },
  ];

  return (
    <AdminTable
      title="Слоты"
      apiUrl="/api/admin/slots"
      columns={columns}
      fields={fields}
    />
  );
}
