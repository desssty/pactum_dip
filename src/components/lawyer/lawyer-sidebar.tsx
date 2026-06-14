"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Briefcase,
  Calendar,
  BookOpen,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/lawyer/profile", label: "Мой профиль", icon: User },
  { href: "/lawyer/services", label: "Услуги", icon: Briefcase },
  { href: "/lawyer/slots", label: "Расписание", icon: Calendar },
  { href: "/lawyer/bookings", label: "Бронирования", icon: BookOpen },
  { href: "/lawyer/wallet", label: "Кошелёк", icon: Wallet },
];

export function LawyerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
      <div className="p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Кабинет юриста
        </p>
      </div>

      <nav className="space-y-1 px-3 pb-6">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#1E2A44] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="size-4" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
