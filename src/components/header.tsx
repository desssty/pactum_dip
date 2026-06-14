// components/header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/lawyers", label: "Юристы" },
];

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
        {/* ── Левая часть: бургер (мобилка) + лого ── */}
        <div className="flex items-center gap-2">
          {/* Бургер — только мобилка */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              className={[
                "inline-flex size-9 items-center justify-center rounded-lg",
                "text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "md:hidden",
              ].join(" ")}
              aria-label="Открыть меню"
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="flex w-[280px] flex-col sm:w-[320px]"
            >
              <div className="flex flex-1 flex-col px-4 py-6">
                <SheetHeader className="mb-6 px-0">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#1E2A44]">
                      <Scale className="size-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-[#1E2A44]">
                      Pactum
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* Мобильная навигация */}
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={[
                        "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-slate-100 text-[#1E2A44]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Мобильные кнопки авторизации */}
                {status !== "loading" && !session?.user && (
                  <div className="mt-auto flex flex-col gap-2 border-t pt-4">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="h-10 w-full">
                        Войти
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="h-10 w-full bg-[#1E2A44] hover:bg-[#162033]">
                        Регистрация
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Лого */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#1E2A44]"
          >
            Pactum
          </Link>
        </div>

        {/* ── Десктопная навигация ── */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "text-sm transition-colors",
                isActive(link.href)
                  ? "font-medium text-[#1E2A44]"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Правая часть ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {status === "loading" ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 sm:w-24 sm:rounded-md" />
          ) : session?.user ? (
            <UserMenu
              user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                role: session.user.role,
              }}
            />
          ) : (
            /* Десктопные кнопки — скрыты на мобилке (есть в бургере) */
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#1E2A44] hover:bg-[#162033]">
                  Регистрация
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
