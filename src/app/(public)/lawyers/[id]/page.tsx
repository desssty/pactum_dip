// src/app/(public)/lawyers/[id]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LawyerProfile from "./_components/lawyer-profile";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const lawyer = await prisma.user.findUnique({
    where: { id, role: "LAWYER" },
    select: { name: true, bio: true },
  });

  if (!lawyer) {
    return { title: "Юрист не найден | Pactum" };
  }

  return {
    title: `${lawyer.name} | Pactum`,
    description:
      lawyer.bio?.slice(0, 160) || `Юрист ${lawyer.name} на платформе Pactum`,
  };
}

export default async function LawyerPage({ params }: Props) {
  const { id } = await params;

  const lawyer = await prisma.user.findUnique({
    where: { id, role: "LAWYER" },
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
          title: true,
          description: true,
          price: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          ratings: {
            select: { value: true },
          },
          _count: {
            select: {
              bookings: {
                where: { status: "COMPLETED" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lawyer) {
    notFound();
  }

  // Общая статистика юриста
  const allRatings = lawyer.lawyerServices.flatMap((s) => s.ratings);
  const ratingsCount = allRatings.length;
  const avgRating =
    ratingsCount > 0
      ? allRatings.reduce((sum, r) => sum + r.value, 0) / ratingsCount
      : null;

  const totalCompleted = lawyer.lawyerServices.reduce(
    (sum, s) => sum + s._count.bookings,
    0,
  );

  const serialized = {
    id: lawyer.id,
    name: lawyer.name,
    image: lawyer.image,
    bio: lawyer.bio,
    createdAt: lawyer.createdAt.toISOString(),
    avgRating: avgRating ? Number(avgRating.toFixed(1)) : null,
    ratingsCount,
    totalCompleted,
    services: lawyer.lawyerServices.map((service) => {
      const sRatings = service.ratings;
      const sAvg =
        sRatings.length > 0
          ? sRatings.reduce((sum, r) => sum + r.value, 0) / sRatings.length
          : null;

      return {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price.toString(),
        category: service.category,
        avgRating: sAvg ? Number(sAvg.toFixed(1)) : null,
        ratingsCount: sRatings.length,
        completedCount: service._count.bookings,
      };
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <LawyerProfile lawyer={serialized} />
    </div>
  );
}
