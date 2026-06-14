import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(100).optional(),
  image: z
    .union([
      z.string().url(),
      z.string().startsWith("/uploads/"),
      z.string().startsWith("/images/"),
    ])
    .optional()
    .nullable(),
});

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      balance: true,
      createdAt: true,
      _count: {
        select: {
          clientBookings: { where: { status: "BOOKED" } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Не найден" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    balance: Number(user.balance),
    createdAt: user.createdAt.toISOString(),
  });
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "CLIENT") {
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
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json(updated);
}
