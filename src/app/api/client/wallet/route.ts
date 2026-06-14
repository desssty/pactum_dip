import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { balance: true },
    }),
    prisma.walletTransaction.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        booking: {
          select: { serviceTitleSnapshot: true },
        },
      },
    }),
  ]);

  const serialized = transactions.map((tx) => ({
    ...tx,
    amount: Number(tx.amount),
    createdAt: tx.createdAt.toISOString(),
  }));

  return NextResponse.json({
    balance: Number(user?.balance ?? 0),
    transactions: serialized,
  });
}
