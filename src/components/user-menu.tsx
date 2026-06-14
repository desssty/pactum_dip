"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Wallet,
  History,
} from "lucide-react";

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
};

export function UserMenu({ user }: Props) {
  const router = useRouter();

  const displayName = user.name || "Пользователь";
  const displayEmail = user.email || "Без email";
  const isLocalUpload = !!user.image && user.image.startsWith("/uploads/");

  const navigate = (href: string) => {
    router.push(href);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-100 focus:outline-none"
        aria-label="Меню пользователя"
      >
        <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-[#1E2A44] text-white">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              width={32}
              height={32}
              unoptimized={isLocalUpload}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <User className="size-4" />
          )}
        </div>

        <span className="hidden max-w-[120px] truncate font-medium md:block">
          {displayName}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-slate-900">{displayName}</p>
          <p className="truncate text-xs text-slate-500">{displayEmail}</p>
        </div>

        <DropdownMenuSeparator />

        {user.role === "ADMIN" && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate("/admin")}
          >
            <LayoutDashboard className="size-4" />
            Админ-панель
          </DropdownMenuItem>
        )}

        {user.role === "LAWYER" && (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/lawyer/profile")}
            >
              <LayoutDashboard className="size-4" />
              Кабинет юриста
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/lawyer/services")}
            >
              <Briefcase className="size-4" />
              Мои услуги
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/lawyer/bookings")}
            >
              <BookOpen className="size-4" />
              Бронирования
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/lawyer/wallet")}
            >
              <Wallet className="size-4" />
              Кошелёк
            </DropdownMenuItem>
          </>
        )}

        {user.role === "CLIENT" && (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/client/profile")}
            >
              <User className="size-4" />
              Мой профиль
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/client/bookings")}
            >
              <BookOpen className="size-4" />
              Мои записи
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/client/history")}
            >
              <History className="size-4" />
              История
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/client/wallet")}
            >
              <Wallet className="size-4" />
              Кошелёк
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
