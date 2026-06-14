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

  const slots = await prisma.slot.findMany({
    where: search
      ? { lawyer: { name: { contains: search, mode: "insensitive" } } }
      : undefined,
    include: {
      lawyer: { select: { id: true, name: true } },
      booking: {
        select: {
          id: true,
          client: { select: { name: true } },
          service: { select: { title: true } },
        },
      },
    },
    orderBy: { startAt: "desc" },
  });

  return NextResponse.json(slots);
}
