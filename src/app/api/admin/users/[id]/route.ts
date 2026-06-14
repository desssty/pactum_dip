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
  const { name, email, role, bio, balance, image } = body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      bio: bio || null,
      ...(balance !== undefined && { balance }),
      // image может быть пустой строкой если удалили фото
      ...(image !== undefined && { image: image || null }),
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          lawyerServices: true,
          clientBookings: true,
          lawyerSlots: true,
          ratingsLeft: true,
          walletTransactions: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Пользователь не найден" },
      { status: 404 },
    );
  }

  const blockers: string[] = [];

  if (user._count.lawyerServices > 0) blockers.push("услуги");
  if (user._count.clientBookings > 0) blockers.push("бронирования клиента");
  if (user._count.lawyerSlots > 0) blockers.push("слоты юриста");
  if (user._count.ratingsLeft > 0) blockers.push("отзывы");
  if (user._count.walletTransactions > 0) blockers.push("транзакции кошелька");

  if (blockers.length > 0) {
    return NextResponse.json(
      {
        error: `Нельзя удалить пользователя: есть связанные данные (${blockers.join(", ")})`,
      },
      { status: 409 },
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
