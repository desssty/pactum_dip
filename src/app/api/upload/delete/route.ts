import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await req.json();

  if (!url || !url.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Неверный URL" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", url);

  try {
    await unlink(filePath);
  } catch {
    // файл уже удалён — ок
  }

  return NextResponse.json({ success: true });
}
