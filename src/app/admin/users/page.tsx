"use client";

import Image from "next/image";
import {
  AdminTable,
  Column,
  FieldConfig,
} from "@/components/admin/admin-table";
import { formatDate, formatMoney, roleName } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const columns: Column[] = [
  {
    key: "image",
    label: "Фото",
    render: (val) =>
      val ? (
        <Image
          src={val}
          alt="Avatar"
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
          —
        </div>
      ),
  },
  { key: "name", label: "Имя" },
  { key: "email", label: "Email" },
  {
    key: "role",
    label: "Роль",
    render: (val) => (
      <Badge
        variant={
          val === "ADMIN"
            ? "default"
            : val === "LAWYER"
              ? "secondary"
              : "outline"
        }
      >
        {roleName(val)}
      </Badge>
    ),
  },
  {
    key: "balance",
    label: "Баланс",
    render: (val) => formatMoney(val),
  },
  {
    key: "createdAt",
    label: "Создан",
    render: (val) => formatDate(val),
  },
];

const fields: FieldConfig[] = [
  { key: "name", label: "Имя", required: true },
  { key: "email", label: "Email", required: true },
  { key: "password", label: "Пароль (только при создании)" },
  {
    key: "role",
    label: "Роль",
    type: "select",
    options: [
      { value: "CLIENT", label: "Клиент" },
      { value: "LAWYER", label: "Юрист" },
      { value: "ADMIN", label: "Администратор" },
    ],
    defaultValue: "CLIENT",
  },
  { key: "balance", label: "Баланс", type: "number" },
  { key: "bio", label: "Описание", type: "textarea" },
  { key: "image", label: "Аватар", type: "image" },
];

export default function AdminUsersPage() {
  return (
    <AdminTable
      title="Пользователи"
      apiUrl="/api/admin/users"
      columns={columns}
      fields={fields}
    />
  );
}
