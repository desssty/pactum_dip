import { useState } from "react";
import { toast } from "sonner";

export function useAvatarUpload(onSuccess: (url: string) => void) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Клиентская валидация
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Допустимые форматы: JPG, PNG, WebP, GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Максимальный размер: 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        // Важно: НЕ устанавливаем Content-Type,
        // браузер сам добавит multipart boundary
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Ошибка загрузки");
        return;
      }

      onSuccess(json.url);
    } catch {
      toast.error("Ошибка сети при загрузке");
    } finally {
      setUploading(false);
      // Сбрасываем input чтобы можно было выбрать тот же файл снова
      e.target.value = "";
    }
  };

  return { uploading, handleFileChange };
}
