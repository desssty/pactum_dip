"use client";

import { useState, useEffect } from "react";
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
  Menu,
  X,
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
  const [open, setOpen] = useState(false);

  // Закрываем меню при переходе на другую страницу
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Блокируем скролл фона при открытом меню
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#1E2A44]">
            <Scale className="size-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#1E2A44]">
            Админ-панель
          </span>
        </div>

        {/* Кнопка закрытия на мобилке */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Закрыть меню"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
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
              <item.icon className="size-4 shrink-0" />
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
    </>
  );

  return (
    <>
      {/* МОБИЛЬНЫЙ ХЭДЕР с бургером — виден только на мобилке */}
      <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#1E2A44]">
            <Scale className="size-3.5 text-white" />
          </div>
          <span className="text-base font-semibold text-[#1E2A44]">
            Админ-панель
          </span>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Открыть меню"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* ДЕСКТОПНЫЙ САЙДБАР — виден только на ≥1024px */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* МОБИЛЬНЫЙ САЙДБАР — выезжает слева по клику на бургер */}
      {open && (
        <>
          {/* Затемнение фона */}
          <div
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Сам сайдбар */}
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
