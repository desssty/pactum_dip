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

  const bookings = await prisma.booking.findMany({
    where: search
      ? {
          OR: [
            {
              client: { name: { contains: search, mode: "insensitive" } },
            },
            { serviceTitleSnapshot: { contains: search, mode: "insensitive" } },
            { lawyerNameSnapshot: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      client: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, title: true } },
      slot: { select: { id: true, startAt: true, endAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}
