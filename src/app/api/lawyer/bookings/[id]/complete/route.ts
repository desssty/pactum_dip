import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();

  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: {
          id,
          status: "BOOKED",
          service: { lawyerId: session.id },
        },
        include: { service: true },
      });

      if (!booking) {
        throw new Error("NOT_FOUND");
      }

      const freshBooking = await tx.booking.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!freshBooking || freshBooking.status !== "BOOKED") {
        throw new Error("ALREADY_PROCESSED");
      }

      // Проверка времени: завершить можно только после окончания услуги
      const now = new Date();
      const slotEnd = new Date(booking.slotEndSnapshot);

      if (now < slotEnd) {
        throw new Error("TOO_EARLY");
      }

      // 1. Завершаем бронирование
      await tx.booking.update({
        where: { id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      // 2. Начисляем деньги юристу
      await tx.user.update({
        where: { id: session.id },
        data: { balance: { increment: booking.paidAmount } },
      });

      // 3. Записываем транзакцию выплаты
      await tx.walletTransaction.create({
        data: {
          userId: session.id,
          bookingId: id,
          type: "SERVICE_PAYOUT",
          status: "COMPLETED",
          amount: booking.paidAmount,
          description: `Выплата за услугу: ${booking.serviceTitleSnapshot}`,
        },
      });

      // 4. Слот → BLOCKED
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: "BLOCKED" },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json(
          { error: "Бронирование не найдено или уже завершено/отменено" },
          { status: 404 },
        );
      }

      if (error.message === "ALREADY_PROCESSED") {
        return NextResponse.json(
          {
            error:
              "Невозможно завершить: бронирование уже было отменено клиентом",
          },
          { status: 409 },
        );
      }

      if (error.message === "TOO_EARLY") {
        return NextResponse.json(
          {
            error:
              "Завершить услугу можно только после окончания времени слота",
          },
          { status: 400 },
        );
      }
    }

    console.error("[complete] Ошибка:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
