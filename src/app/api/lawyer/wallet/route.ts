import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
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
      take: 20,
      include: {
        booking: {
          select: { serviceTitleSnapshot: true },
        },
      },
    }),
  ]);

  return NextResponse.json({ balance: user?.balance ?? 0, transactions });
}
