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

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { lawyer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice) {
    where.price = { ...where.price, gte: parseFloat(minPrice) };
  }
  if (maxPrice) {
    where.price = { ...where.price, lte: parseFloat(maxPrice) };
  }

  // select вынесли — он одинаковый для обоих случаев
  const select = {
    id: true,
    title: true,
    description: true,
    price: true,
    createdAt: true,
    category: {
      select: { id: true, name: true },
    },
    lawyer: {
      select: { id: true, name: true, image: true },
    },
    ratings: {
      select: { value: true },
    },
    _count: {
      select: {
        bookings: { where: { status: "COMPLETED" } },
      },
    },
  } as const;

  // Хелпер маппинга — одно место, не дублируем
  const mapService = (service: any) => {
    const ratings = service.ratings as { value: number }[];
    const avgRating =
      ratings.length > 0
        ? ratings.reduce(
            (sum: number, r: { value: number }) => sum + r.value,
            0,
          ) / ratings.length
        : null;

    return {
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      createdAt: service.createdAt,
      category: service.category,
      lawyer: service.lawyer,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      ratingsCount: ratings.length,
      completedCount: service._count.bookings,
    };
  };

  try {
    // ── Сортировка по рейтингу — отдельная ветка ──────────────────────
    if (sort === "rating_desc" || sort === "rating_asc") {
      // Грузим все подходящие записи без пагинации
      const allServices = await prisma.service.findMany({
        where,
        select,
      });

      // Считаем avgRating и сортируем в JS
      const withAvg = allServices
        .map((s) => {
          const avg =
            s.ratings.length > 0
              ? s.ratings.reduce((sum, r) => sum + r.value, 0) /
                s.ratings.length
              : null;
          return { ...s, _avg: avg };
        })
        .sort((a, b) => {
          // Услуги без рейтинга всегда в конце
          if (a._avg === null && b._avg === null) return 0;
          if (a._avg === null) return 1;
          if (b._avg === null) return -1;
          return sort === "rating_desc" ? b._avg - a._avg : a._avg - b._avg;
        });

      const total = withAvg.length;
      const totalPages = Math.ceil(total / limit);

      // Пагинация вручную
      const paginated = withAvg.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        services: paginated.map(mapService),
        total,
        page,
        totalPages,
      });
    }

    // ── Обычная сортировка — Prisma orderBy ───────────────────────────
    let orderBy: any;

    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "title_asc":
        orderBy = { title: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select,
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({
      services: services.map(mapService),
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
