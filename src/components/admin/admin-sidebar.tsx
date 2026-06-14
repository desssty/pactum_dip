"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Scale,
  Users,
  FolderOpen,
  Briefcase,
  Clock,
  CalendarCheck,
  Star,
  Wallet,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/categories", label: "Категории", icon: FolderOpen },
  { href: "/admin/services", label: "Услуги", icon: Briefcase },
  { href: "/admin/slots", label: "Слоты", icon: Clock },
  { href: "/admin/bookings", label: "Бронирования", icon: CalendarCheck },
  { href: "/admin/ratings", label: "Отзывы", icon: Star },
  { href: "/admin/transactions", label: "Транзакции", icon: Wallet },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#1E2A44]">
          <Scale className="size-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-[#1E2A44]">
          Админ-панель
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1E2A44] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <Scale className="size-4" />
            На сайт
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm text-red-600 hover:text-red-700"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" />
          Выйти
        </Button>
      </div>
    </aside>
  );
}
