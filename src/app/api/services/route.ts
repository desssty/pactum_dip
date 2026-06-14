import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim() || "";
  const categoryId = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const where: any = {
    deletedAt: null,
  };

  // Поиск по названию и описанию
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { lawyer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Фильтр по категории
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Фильтр по цене
  if (minPrice) {
    where.price = { ...where.price, gte: parseFloat(minPrice) };
  }
  if (maxPrice) {
    where.price = { ...where.price, lte: parseFloat(maxPrice) };
  }

  // Сортировка
  let orderBy: any;
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
            },
          },
          ratings: {
            select: {
              value: true,
            },
          },
          _count: {
            select: {
              bookings: {
                where: { status: "COMPLETED" },
              },
            },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    // Добавляем средний рейтинг
    const servicesWithRating = services.map((service) => {
      const ratings = service.ratings;
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
          : null;

      return {
        ...service,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        ratingsCount: ratings.length,
        completedCount: service._count.bookings,
        ratings: undefined,
        _count: undefined,
      };
    });

    return NextResponse.json({
      services: servicesWithRating,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки услуг" },
      { status: 500 },
    );
  }
}
