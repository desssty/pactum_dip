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

  const category = await prisma.category.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Категория не найдена" },
      { status: 404 },
    );
  }

  const serviceCount = await prisma.service.count({
    where: { categoryId: id },
  });

  if (serviceCount > 0) {
    return NextResponse.json(
      { error: "Нельзя удалить категорию: у неё есть связанные услуги" },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
