import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // BOOKED | COMPLETED | CANCELED

  const bookings = await prisma.booking.findMany({
    where: {
      service: { lawyerId: session.id },
      ...(status && { status: status as any }),
    },
    include: {
      client: { select: { id: true, name: true, email: true, image: true } },
      service: { select: { id: true, title: true } },
      slot: { select: { startAt: true, endAt: true } },
      rating: { select: { value: true, comment: true } },
    },
    orderBy: { slot: { startAt: "asc" } },
  });

  return NextResponse.json(bookings);
}
