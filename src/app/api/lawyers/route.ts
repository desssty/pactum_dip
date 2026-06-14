// src/app/api/lawyers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "12");

    const where: any = {
      role: "LAWYER",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    const [lawyers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          createdAt: true,
          lawyerServices: {
            where: { deletedAt: null },
            select: {
              id: true,
              ratings: {
                select: { value: true },
              },
            },
          },
          _count: {
            select: {
              lawyerServices: {
                where: { deletedAt: null },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const mapped = lawyers.map((lawyer) => {
      const allRatings = lawyer.lawyerServices.flatMap((s) => s.ratings);
      const ratingsCount = allRatings.length;
      const avgRating =
        ratingsCount > 0
          ? allRatings.reduce((sum, r) => sum + r.value, 0) / ratingsCount
          : null;

      return {
        id: lawyer.id,
        name: lawyer.name,
        image: lawyer.image,
        bio: lawyer.bio,
        servicesCount: lawyer._count.lawyerServices,
        avgRating: avgRating ? Number(avgRating.toFixed(1)) : null,
        ratingsCount,
      };
    });

    return NextResponse.json({
      lawyers: mapped,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/lawyers error:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки юристов" },
      { status: 500 },
    );
  }
}
