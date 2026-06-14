import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;

  const slot = await prisma.slot.findFirst({
    where: { id, lawyerId: session.id },
    include: { booking: true },
  });

  if (!slot) {
    return NextResponse.json({ error: "Слот не найден" }, { status: 404 });
  }

  if (slot.booking || slot.status === "BOOKED") {
    return NextResponse.json(
      { error: "Нельзя удалить слот: он уже использовался в бронировании" },
      { status: 409 },
    );
  }

  await prisma.slot.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["OPEN", "BLOCKED"].includes(status)) {
    return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
  }

  const slot = await prisma.slot.findFirst({
    where: { id, lawyerId: session.id },
    include: { booking: true },
  });

  if (!slot) {
    return NextResponse.json({ error: "Слот не найден" }, { status: 404 });
  }

  if (slot.booking || slot.status === "BOOKED") {
    return NextResponse.json(
      { error: "Нельзя изменить слот: он уже использовался в бронировании" },
      { status: 409 },
    );
  }

  const updated = await prisma.slot.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
