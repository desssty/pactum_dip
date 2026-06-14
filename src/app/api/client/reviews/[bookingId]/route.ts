import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  value: z.coerce.number().int().min(1, "Минимум 1").max(5, "Максимум 5"),
  comment: z.string().max(1000, "Максимум 1000 символов").optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { bookingId } = await params;
  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  // Проверяем бронирование
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      clientId: session.id,
      status: "COMPLETED",
    },
    include: { rating: true },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Бронирование не найдено или не завершено" },
      { status: 404 },
    );
  }

  if (booking.rating) {
    return NextResponse.json({ error: "Отзыв уже оставлен" }, { status: 409 });
  }

  const rating = await prisma.rating.create({
    data: {
      bookingId,
      clientId: session.id,
      serviceId: booking.serviceId,
      value: parsed.data.value,
      comment: parsed.data.comment || null,
    },
  });

  return NextResponse.json(rating, { status: 201 });
}
