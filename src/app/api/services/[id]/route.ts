import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        ratings: {
          select: {
            value: true,
            comment: true,
            createdAt: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            ratings: true,
            bookings: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
    }

    const allRatings = await prisma.rating.findMany({
      where: { serviceId: id },
      select: { value: true },
    });

    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length
        : null;

    const slots = await prisma.slot.findMany({
      where: {
        lawyerId: service.lawyer.id,
        status: "OPEN",
        startAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
      },
      orderBy: { startAt: "asc" },
      take: 20,
    });

    return NextResponse.json({
      ...service,
      price: service.price.toString(),
      createdAt: service.createdAt.toISOString(),
      avgRating: avgRating ? Number(avgRating.toFixed(1)) : null,
      ratingsCount: allRatings.length,
      completedCount: service._count.bookings,
      slots: slots.map((slot) => ({
        ...slot,
        startAt: slot.startAt.toISOString(),
        endAt: slot.endAt.toISOString(),
      })),
      ratings: service.ratings.map((rating) => ({
        ...rating,
        createdAt: rating.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/services/[id] error:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки услуги" },
      { status: 500 },
    );
  }
}
