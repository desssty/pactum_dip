import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3, "Минимум 3 символа").max(200),
  description: z.string().min(10, "Минимум 10 символов").max(3000),
  price: z.coerce.number().positive("Цена должна быть положительной"),
  categoryId: z.string().min(1, "Выберите категорию"),
});

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const services = await prisma.service.findMany({
    where: {
      lawyerId: session.id,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      category: {
        select: { id: true, name: true },
      },
      _count: {
        select: {
          bookings: {
            where: { status: { in: ["BOOKED"] } },
          },
        },
      },
      ratings: {
        select: { value: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = services.map((s) => ({
    ...s,
    activeBookings: s._count.bookings,
    avgRating:
      s.ratings.length > 0
        ? s.ratings.reduce((sum, r) => sum + r.value, 0) / s.ratings.length
        : null,
    reviewCount: s.ratings.length,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  // Проверяем что категория существует
  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Категория не найдена" },
      { status: 404 },
    );
  }

  const service = await prisma.service.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      lawyerId: session.id,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(service, { status: 201 });
}
