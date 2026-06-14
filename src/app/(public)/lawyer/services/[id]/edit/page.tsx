import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/lawyer/service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  const { id } = await params;

  const service = await prisma.service.findFirst({
    where: { id, lawyerId: session!.id, deletedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      categoryId: true,
    },
  });

  if (!service) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Редактирование услуги
      </h1>
      <div className="rounded-2xl border bg-white p-6">
        <ServiceForm
          serviceId={service.id}
          defaultValues={{
            title: service.title,
            description: service.description,
            price: Number(service.price),
            categoryId: service.categoryId,
          }}
        />
      </div>
    </div>
  );
}
