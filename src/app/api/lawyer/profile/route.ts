import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Принимаем и полные URL (https://...) и локальные пути (/uploads/...)
const imageValue = z.union([
  z.string().url(),
  z.string().startsWith("/uploads/"),
  z.string().startsWith("/images/"),
]);

const updateSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(100).optional(),
  bio: z.string().max(1000, "Максимум 1000 символов").optional(),
  image: imageValue.optional().nullable(),
});

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
      balance: true,
      createdAt: true,
      _count: {
        select: {
          lawyerServices: { where: { deletedAt: null } },
          lawyerSlots: { where: { status: "OPEN" } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Пользователь не найден" },
      { status: 404 },
    );
  }

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
    },
  });

  return NextResponse.json(updated);
}
