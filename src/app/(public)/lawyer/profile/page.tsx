import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { LawyerProfileClient } from "./_components/lawyer-profile-client";

export default async function LawyerProfilePage() {
  const session = await getCurrentUser();

  const user = await prisma.user.findUnique({
    where: { id: session!.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
      balance: true,
      createdAt: true,
      _count: {
        select: {
          lawyerServices: { where: { deletedAt: null } },
          lawyerSlots: { where: { status: "OPEN" } },
        },
      },
    },
  });

  if (!user) return null;

  const serializedUser = {
    ...user,
    balance: Number(user.balance),
    createdAt: user.createdAt.toISOString(),
  };

  return <LawyerProfileClient user={serializedUser} />;
}
