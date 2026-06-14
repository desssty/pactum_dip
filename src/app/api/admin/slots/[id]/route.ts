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
  const { lawyerId, startAt, endAt, status } = body;

  const slot = await prisma.slot.update({
    where: { id },
    data: {
      ...(lawyerId && { lawyerId }),
      ...(startAt && { startAt: new Date(startAt) }),
      ...(endAt && { endAt: new Date(endAt) }),
      ...(status && { status }),
    },
  });

  return NextResponse.json(slot);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const slot = await prisma.slot.findUnique({
    where: { id },
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
