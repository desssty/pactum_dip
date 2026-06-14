import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const transactions = await prisma.walletTransaction.findMany({
    where: search
      ? { user: { name: { contains: search, mode: "insensitive" } } }
      : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      booking: { select: { id: true, serviceTitleSnapshot: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(transactions);
}
