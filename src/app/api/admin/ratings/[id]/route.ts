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
  const { value, comment } = body;

  const existing = await prisma.rating.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
  }

  const rating = await prisma.rating.update({
    where: { id },
    data: {
      ...(value !== undefined && { value: Number(value) }),
      ...(comment !== undefined && { comment: comment || null }),
    },
  });

  return NextResponse.json(rating);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const rating = await prisma.rating.findUnique({
    where: { id },
  });

  if (!rating) {
    return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
  }

  await prisma.rating.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
