import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { getCurrentUser } from "@/lib/server-auth";

const createBookingSchema = z.object({
  serviceId: z.string().min(1, "serviceId обязателен"),
  slotId: z.string().min(1, "slotId обязателен"),
});

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // BOOKED | COMPLETED | CANCELED

  const bookings = await prisma.booking.findMany({
    where: {
      clientId: session.id,
      ...(status && { status: status as any }),
    },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          lawyer: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      slot: { select: { startAt: true, endAt: true } },
      rating: { select: { id: true, value: true, comment: true } },
    },
    orderBy: { slotStartSnapshot: "desc" },
  });

  // Сериализуем Decimal
  const serialized = bookings.map((b) => ({
    ...b,
    paidAmount: Number(b.paidAmount),
    slot: b.slot
      ? {
          startAt: b.slot.startAt.toISOString(),
          endAt: b.slot.endAt.toISOString(),
        }
      : null,
    slotStartSnapshot: b.slotStartSnapshot.toISOString(),
    slotEndSnapshot: b.slotEndSnapshot.toISOString(),
    createdAt: b.createdAt.toISOString(),
    cancelledAt: b.cancelledAt?.toISOString() ?? null,
    completedAt: b.completedAt?.toISOString() ?? null,
  }));

  return NextResponse.json(serialized);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 },
      );
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Только клиент может записываться на услуги" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные" },
        { status: 400 },
      );
    }

    const { serviceId, slotId } = parsed.data;

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        price: true,
        lawyerId: true,
        category: {
          select: {
            name: true,
          },
        },
        lawyer: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
    }

    const slot = await prisma.slot.findFirst({
      where: {
        id: slotId,
        lawyerId: service.lawyerId,
      },
      select: {
        id: true,
        lawyerId: true,
        startAt: true,
        endAt: true,
        status: true,
        booking: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: "Слот не найден или не принадлежит юристу услуги" },
        { status: 404 },
      );
    }

    if (slot.status !== "OPEN") {
      return NextResponse.json(
        { error: "Слот уже недоступен для бронирования" },
        { status: 400 },
      );
    }

    if (slot.booking) {
      return NextResponse.json(
        { error: "Слот уже забронирован" },
        { status: 400 },
      );
    }

    if (slot.startAt <= new Date()) {
      return NextResponse.json(
        { error: "Нельзя забронировать прошедший слот" },
        { status: 400 },
      );
    }

    const client = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        balance: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 },
      );
    }

    if (client.balance.lt(service.price)) {
      const missing = service.price.sub(client.balance);

      return NextResponse.json(
        {
          error: "Недостаточно средств",
          code: "INSUFFICIENT_BALANCE",
          details: {
            requiredAmount: service.price.toString(),
            currentBalance: client.balance.toString(),
            missingAmount: missing.toString(),
          },
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const freshSlot = await tx.slot.findUnique({
        where: { id: slot.id },
        select: {
          id: true,
          status: true,
          booking: {
            select: { id: true },
          },
        },
      });

      if (!freshSlot || freshSlot.status !== "OPEN" || freshSlot.booking) {
        throw new Error("Слот уже занят");
      }

      await tx.user.update({
        where: { id: client.id },
        data: {
          balance: {
            decrement: service.price,
          },
        },
      });

      await tx.slot.update({
        where: { id: slot.id },
        data: {
          status: "BOOKED",
        },
      });

      const booking = await tx.booking.create({
        data: {
          clientId: client.id,
          serviceId: service.id,
          slotId: slot.id,
          status: "BOOKED",

          paidAmount: service.price,
          serviceTitleSnapshot: service.title,
          lawyerNameSnapshot: service.lawyer.name,
          categoryNameSnapshot: service.category.name,
          slotStartSnapshot: slot.startAt,
          slotEndSnapshot: slot.endAt,
        },
        select: {
          id: true,
          status: true,
          paidAmount: true,
          slotStartSnapshot: true,
          slotEndSnapshot: true,
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: client.id,
          bookingId: booking.id,
          type: "BOOKING_PAYMENT",
          status: "COMPLETED",
          amount: service.price,
          description: `Оплата бронирования услуги "${service.title}"`,
        },
      });

      return booking;
    });

    return NextResponse.json({
      message: "Запись успешно создана",
      booking: {
        ...result,
        paidAmount: result.paidAmount.toString(),
        slotStartSnapshot: result.slotStartSnapshot.toISOString(),
        slotEndSnapshot: result.slotEndSnapshot.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/client/bookings error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации данных" },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Этот слот уже забронирован" },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Ошибка создания записи" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
