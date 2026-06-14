import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const {
    status,
    cancellationReason,
    paidAmount,
    serviceTitleSnapshot,
    lawyerNameSnapshot,
    categoryNameSnapshot,
    slotStartSnapshot,
    slotEndSnapshot,
    lateCancellation,
  } = body;

  const existing = await prisma.booking.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Бронирование не найдено" },
      { status: 404 },
    );
  }

  const updateData: Record<string, unknown> = {};

  if (status) updateData.status = status;
  if (cancellationReason !== undefined)
    updateData.cancellationReason = cancellationReason || null;
  if (paidAmount !== undefined && paidAmount !== "")
    updateData.paidAmount = Number(paidAmount);
  if (serviceTitleSnapshot !== undefined)
    updateData.serviceTitleSnapshot = serviceTitleSnapshot;
  if (lawyerNameSnapshot !== undefined)
    updateData.lawyerNameSnapshot = lawyerNameSnapshot;
  if (categoryNameSnapshot !== undefined)
    updateData.categoryNameSnapshot = categoryNameSnapshot || null;
  if (slotStartSnapshot)
    updateData.slotStartSnapshot = new Date(slotStartSnapshot);
  if (slotEndSnapshot) updateData.slotEndSnapshot = new Date(slotEndSnapshot);
  if (lateCancellation !== undefined)
    updateData.lateCancellation =
      lateCancellation === "true" || lateCancellation === true;

  // Авто-проставление дат при смене статуса
  if (status === "CANCELED" && existing.status !== "CANCELED") {
    updateData.cancelledAt = new Date();
  }
  if (status === "COMPLETED" && existing.status !== "COMPLETED") {
    updateData.completedAt = new Date();
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(booking);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      rating: true,
      _count: {
        select: { walletTransactions: true },
      },
    },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Бронирование не найдено" },
      { status: 404 },
    );
  }

  if (booking.status === "BOOKED") {
    return NextResponse.json(
      {
        error:
          "Нельзя удалить активное бронирование. Сначала отмените или завершите его.",
      },
      { status: 409 },
    );
  }

  if (booking.rating) {
    return NextResponse.json(
      { error: "Нельзя удалить бронирование: к нему привязан отзыв" },
      { status: 409 },
    );
  }

  if (booking._count.walletTransactions > 0) {
    return NextResponse.json(
      { error: "Нельзя удалить бронирование: к нему привязаны транзакции" },
      { status: 409 },
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.slot.update({
      where: { id: booking.slotId },
      data: {
        status: booking.status === "CANCELED" ? "OPEN" : "BLOCKED",
      },
    });

    await tx.booking.delete({
      where: { id },
    });
  });

  return NextResponse.json({ success: true });
}
