"use client";

import { useEffect, useState } from "react";
import {
  AdminTable,
  Column,
  FieldConfig,
} from "@/components/admin/admin-table";
import { formatDate, formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function AdminServicesPage() {
  const [lawyers, setLawyers] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);

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

    fetch("/api/admin/categories?search=")
      .then((r) => r.json())
      .then((cats: any[]) => {
        setCategories(cats.map((c) => ({ value: c.id, label: c.name })));
      });
  }, []);

  const columns: Column[] = [
    { key: "title", label: "Название" },
    {
      key: "lawyer",
      label: "Юрист",
      render: (val) => val?.name ?? "—",
    },
    {
      key: "category",
      label: "Категория",
      render: (val) => val?.name ?? "—",
    },
    {
      key: "price",
      label: "Цена",
      render: (val) => formatMoney(val),
    },
    {
      key: "deletedAt",
      label: "Статус",
      render: (val) =>
        val ? (
          <Badge variant="destructive">Удалена</Badge>
        ) : (
          <Badge variant="outline">Активна</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "Создана",
      render: (val) => formatDate(val),
    },
  ];

  const fields: FieldConfig[] = [
    { key: "title", label: "Название", required: true },
    { key: "description", label: "Описание", type: "textarea", required: true },
    { key: "price", label: "Цена", type: "number", required: true },
    {
      key: "lawyerId",
      label: "Юрист",
      type: "select",
      options: lawyers,
      required: true,
    },
    {
      key: "categoryId",
      label: "Категория",
      type: "select",
      options: categories,
      required: true,
    },
  ];

  return (
    <AdminTable
      title="Услуги"
      apiUrl="/api/admin/services"
      columns={columns}
      fields={fields}
    />
  );
}
