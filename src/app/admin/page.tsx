import { prisma } from "@/lib/prisma";
import {
  Users,
  FolderOpen,
  Briefcase,
  Clock,
  CalendarCheck,
  Star,
  Wallet,
} from "lucide-react";

async function getStats() {
  const [users, categories, services, slots, bookings, ratings, transactions] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.service.count(),
      prisma.slot.count(),
      prisma.booking.count(),
      prisma.rating.count(),
      prisma.walletTransaction.count(),
    ]);

  return {
    users,
    categories,
    services,
    slots,
    bookings,
    ratings,
    transactions,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const cards = [
    { label: "Пользователи", value: stats.users, icon: Users },
    { label: "Категории", value: stats.categories, icon: FolderOpen },
    { label: "Услуги", value: stats.services, icon: Briefcase },
    { label: "Слоты", value: stats.slots, icon: Clock },
    { label: "Бронирования", value: stats.bookings, icon: CalendarCheck },
    { label: "Отзывы", value: stats.ratings, icon: Star },
    { label: "Транзакции", value: stats.transactions, icon: Wallet },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Обзор системы</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#1E2A44]/10 text-[#1E2A44]">
                <card.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
