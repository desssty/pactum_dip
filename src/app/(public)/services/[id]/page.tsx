import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServiceDetails from "./_components/service-details";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id, deletedAt: null },
    select: { title: true, description: true },
  });

  if (!service) {
    return { title: "Услуга не найдена | Pactum" };
  }

  return {
    title: `${service.title} | Pactum`,
    description: service.description.slice(0, 160),
  };
}

export default async function ServicePage({ params }: Props) {
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
    notFound();
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

  const serializedService = {
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
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ServiceDetails service={serializedService} />
    </div>
  );
}
