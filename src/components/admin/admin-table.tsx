"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Archive, Plus, Search } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { toast } from "sonner";

export type Column = {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
};

export type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "datetime-local" | "image";
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
};

type Props = {
  title: string;
  apiUrl: string;
  columns: Column[];
  fields?: FieldConfig[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  deleteLabel?: string;
  deleteDescription?: string;
};

export function AdminTable({
  title,
  apiUrl,
  columns,
  fields = [],
  canCreate = true,
  canEdit = true,
  canDelete = true,
  deleteLabel = "Архивировать запись?",
  deleteDescription = "Запись будет скрыта из системы. Если у записи есть связанные данные, операция будет отклонена.",
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${apiUrl}${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const handleCreate = () => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.key] = f.defaultValue || "";
    });
    setFormData(initial);
    setError("");
    setCreateOpen(true);
  };

  const handleEdit = (item: any) => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      let val = item[f.key];
      if (f.type === "datetime-local" && val) {
        val = new Date(val).toISOString().slice(0, 16);
      }
      initial[f.key] = val?.toString() ?? "";
    });
    setFormData(initial);
    setError("");
    setEditItem(item);
  };

  const handleSave = async () => {
    setError("");
    try {
      const url = editItem ? `${apiUrl}/${editItem.id}` : apiUrl;
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Ошибка сохранения");
        return;
      }

      toast.success(editItem ? "Запись обновлена" : "Запись создана");
      setEditItem(null);
      setCreateOpen(false);
      fetchData();
    } catch {
      setError("Ошибка сети");
    }
  };

  // В компоненте AdminTable, заменить handleDelete:

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const res = await fetch(`${apiUrl}/${deleteId}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        // Не закрываем диалог здесь — покажем ошибку в самом диалоге
        setError(json.error || "Ошибка архивации");
        setDeleting(false);
        return;
      }

      // Успех — закрываем и показываем toast
      setDeleteId(null);
      setError("");
      toast.success("Запись архивирована");
      fetchData();
    } catch {
      setError("Ошибка сети");
    } finally {
      setDeleting(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case "image":
        return (
          <ImageUpload
            value={formData[field.key] || ""}
            onChange={(url) => updateField(field.key, url)}
          />
        );

      case "select":
        return (
          <select
            value={formData[field.key] || ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Выберите...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            value={formData[field.key] || ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        );

      default:
        return (
          <Input
            type={field.type || "text"}
            value={formData[field.key] || ""}
            onChange={(e) => updateField(field.key, e.target.value)}
          />
        );
    }
  };

  const renderForm = () => (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </Label>
          {renderField(field)}
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            setEditItem(null);
            setCreateOpen(false);
          }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[#1E2A44] hover:bg-[#162033]"
        >
          Сохранить
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {canCreate && fields.length > 0 && (
          <Button
            onClick={handleCreate}
            className="gap-2 bg-[#1E2A44] hover:bg-[#162033]"
          >
            <Plus className="size-4" />
            Добавить
          </Button>
        )}
      </div>

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              {(canEdit || canDelete) && (
                <TableHead className="w-24">Действия</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="py-8 text-center text-slate-500"
                >
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="py-8 text-center text-slate-500"
                >
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key]?.toString() ?? "—")}
                    </TableCell>
                  ))}
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex gap-1">
                        {canEdit && fields.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(row)}
                            title="Редактировать"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => setDeleteId(row.id)}
                            title="Архивировать"
                          >
                            <Archive className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* EDIT DIALOG */}
      <Dialog
        open={editItem !== null}
        onOpenChange={(open) => !open && setEditItem(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактирование</DialogTitle>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Добавление</DialogTitle>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      {/* ARCHIVE CONFIRM */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteId(null);
            setError("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteLabel}</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {deleting ? "Архивация..." : "Архивировать"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
