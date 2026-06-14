import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isBefore, subHours } from "date-fns";

const cancelSchema = z.object({
  reason: z.string().max(500, "Максимум 500 символов").optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = cancelSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    let lateCancellation = false;

    await prisma.$transaction(async (tx) => {
      // Читаем актуальный статус внутри транзакции
      const booking = await tx.booking.findFirst({
        where: {
          id,
          clientId: session.id,
        },
        include: { slot: true },
      });

      if (!booking) {
        throw new Error("NOT_FOUND");
      }

      // Проверяем статус — если уже не BOOKED, отказываем
      if (booking.status === "COMPLETED") {
        throw new Error("ALREADY_COMPLETED");
      }

      if (booking.status === "CANCELED") {
        throw new Error("ALREADY_CANCELED");
      }

      const now = new Date();
      lateCancellation = isBefore(subHours(booking.slot.startAt, 2), now);

      // 1. Отменяем бронирование
      await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELED",
          cancellationReason: parsed.data?.reason || null,
          cancelledAt: now,
          lateCancellation,
        },
      });

      // 2. Освобождаем слот
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: "OPEN" },
      });

      // 3. Возвращаем деньги клиенту
      await tx.user.update({
        where: { id: session.id },
        data: { balance: { increment: booking.paidAmount } },
      });

      // 4. Записываем возврат
      await tx.walletTransaction.create({
        data: {
          userId: session.id,
          bookingId: id,
          type: "BOOKING_REFUND",
          status: "COMPLETED",
          amount: booking.paidAmount,
          description: `Возврат за отмену: ${booking.serviceTitleSnapshot}`,
        },
      });
    });

    return NextResponse.json({ success: true, lateCancellation });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json(
          { error: "Бронирование не найдено" },
          { status: 404 },
        );
      }
      if (error.message === "ALREADY_COMPLETED") {
        return NextResponse.json(
          {
            error: "Невозможно отменить: услуга уже была завершена юристом",
          },
          { status: 409 },
        );
      }
      if (error.message === "ALREADY_CANCELED") {
        return NextResponse.json(
          { error: "Бронирование уже отменено" },
          { status: 409 },
        );
      }
    }

    console.error("[cancel] Ошибка:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
