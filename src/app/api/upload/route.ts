import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
  }

  // проверка типа
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Допустимые форматы: JPG, PNG, WebP, GIF" },
      { status: 400 },
    );
  }

  // проверка размера (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Максимальный размер файла: 5MB" },
      { status: 400 },
    );
  }

  // генерируем уникальное имя
  const ext = file.name.split(".").pop();
  const fileName = `${randomUUID()}.${ext}`;

  // создаём папку если нет
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  // сохраняем файл
  const bytes = new Uint8Array(await file.arrayBuffer());
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, bytes);

  // возвращаем URL
  const url = `/uploads/${fileName}`;

  return NextResponse.json({ url });
}
