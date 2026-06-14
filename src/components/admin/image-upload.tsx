"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Trash2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  onDeleteFile?: (url: string) => void;
};

export function ImageUpload({ value, onChange, onDeleteFile }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Ошибка сети при загрузке");
    } finally {
      setUploading(false);
      // сбрасываем input чтобы можно было загрузить тот же файл
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    // просто очищаем поле, файл НЕ удаляется с сервера
    onChange("");
    setConfirmDelete(false);
  };

  const handleDeleteFile = async () => {
    if (!value) return;

    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
    } catch {
      // ничего страшного
    }

    onChange("");
    setConfirmDelete(false);
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block">
          <div className="overflow-hidden rounded-lg border">
            <Image
              src={value}
              alt="Preview"
              width={200}
              height={150}
              className="h-[150px] w-[200px] object-cover"
            />
          </div>

          <div className="mt-2 flex gap-2">
            {/* Кнопка "Очистить" — просто убирает URL, файл остаётся */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={handleClear}
            >
              <X className="size-3" />
              Очистить
            </Button>

            {/* Кнопка "Удалить файл" — удаляет с сервера */}
            {!confirmDelete ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 text-xs text-red-600 hover:text-red-700"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-3" />
                Удалить файл
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-600">Точно удалить?</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                  onClick={handleDeleteFile}
                >
                  Да
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setConfirmDelete(false)}
                >
                  Нет
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-8 transition-colors hover:border-[#1E2A44]/50 hover:bg-slate-50"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mb-2 size-8 text-slate-400" />
          <p className="text-sm text-slate-500">
            {uploading ? "Загрузка..." : "Нажмите для загрузки"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            JPG, PNG, WebP, GIF • до 5MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Возможность вставить URL вручную */}
      {!value && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">или</span>
          <button
            type="button"
            className="text-xs text-[#1E2A44] underline underline-offset-2"
            onClick={() => {
              const url = prompt("Вставьте URL изображения:");
              if (url) onChange(url);
            }}
          >
            вставить ссылку
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
