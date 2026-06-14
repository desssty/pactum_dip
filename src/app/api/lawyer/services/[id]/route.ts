import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(3000).optional(),
  price: z.coerce.number().positive().optional(),
  categoryId: z.string().min(1).optional(),
});

async function getOwnService(serviceId: string, lawyerId: string) {
  return prisma.service.findFirst({
    where: { id: serviceId, lawyerId, deletedAt: null },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  const service = await prisma.service.findFirst({
    where: { id, lawyerId: session.id, deletedAt: null },
    include: {
      category: { select: { id: true, name: true } },
      _count: {
        select: { bookings: { where: { status: "BOOKED" } } },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  const service = await getOwnService(id, session.id);
  if (!service) {
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  if (parsed.data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 },
      );
    }
  }

  const updated = await prisma.service.update({
    where: { id },
    data: parsed.data,
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  const service = await getOwnService(id, session.id);
  if (!service) {
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }

  const bookingsCount = await prisma.booking.count({
    where: { serviceId: id },
  });

  if (bookingsCount > 0) {
    return NextResponse.json(
      {
        error: "Нельзя удалить услугу: по ней уже есть история бронирований",
      },
      { status: 409 },
    );
  }

  await prisma.service.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
