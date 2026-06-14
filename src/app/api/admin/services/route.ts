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

  const services = await prisma.service.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { lawyer: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      lawyer: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { bookings: true, ratings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(services);
}
