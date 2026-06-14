import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const transaction = await prisma.walletTransaction.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      bookingId: true,
    },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Транзакция не найдена" },
      { status: 404 },
    );
  }

  if (transaction.bookingId) {
    return NextResponse.json(
      {
        error: "Нельзя удалить транзакцию: она связана с бронированием",
      },
      { status: 409 },
    );
  }

  if (transaction.status === "COMPLETED") {
    return NextResponse.json(
      {
        error: "Нельзя удалить проведённую транзакцию",
      },
      { status: 409 },
    );
  }

  await prisma.walletTransaction.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
