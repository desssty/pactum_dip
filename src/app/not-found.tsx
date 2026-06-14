// app/not-found.tsx
import Link from "next/link";
import { Scale, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Шапка */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#1E2A44]">
              <Scale className="size-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1E2A44]">Pactum</span>
          </Link>
        </div>
      </header>

      {/* Контент */}
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:py-24">
        <div className="text-center">
          {/* 404 */}
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-[#1E2A44]/5 sm:mb-8 sm:size-28">
            <span className="text-4xl font-black text-[#1E2A44] sm:text-6xl">
              404
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">
            Страница не найдена
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 sm:mt-4 sm:text-base">
            К сожалению, запрашиваемая страница не существует, была удалена или
            перемещена по другому адресу.
          </p>

          {/* Кнопки */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-6 text-sm font-medium text-white transition-colors hover:bg-[#162033] sm:w-auto"
            >
              <Home className="size-4" />
              На главную
            </Link>

            <Link
              href="/catalog"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-input bg-white px-6 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 sm:w-auto"
            >
              <Search className="size-4" />
              Каталог услуг
            </Link>
          </div>

          {/* Назад */}
          <div className="mt-6 sm:mt-8">
            <Link
              href="javascript:history.back()"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-[#1E2A44]"
            >
              <ArrowLeft className="size-3.5" />
              Вернуться назад
            </Link>
          </div>
        </div>
      </main>

      {/* Подвал */}
      <footer className="border-t bg-white py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:px-6 sm:text-sm">
          © {new Date().getFullYear()} Pactum. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
