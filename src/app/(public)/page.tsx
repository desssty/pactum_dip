import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Star,
  CalendarClock,
  ArrowRight,
  Users,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [lawyerCount, serviceCount, categoryCount] = await Promise.all([
    prisma.user.count({ where: { role: "LAWYER" } }),
    prisma.service.count({ where: { deletedAt: null } }),
    prisma.category.count(),
  ]);
  return { lawyerCount, serviceCount, categoryCount };
}

async function getFeaturedLawyers() {
  return prisma.user.findMany({
    where: { role: "LAWYER" },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      _count: {
        select: {
          lawyerServices: {
            where: { deletedAt: null },
          },
        },
      },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      _count: {
        select: {
          services: {
            where: { deletedAt: null },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function HomePage() {
  const [stats, lawyers, categories] = await Promise.all([
    getStats(),
    getFeaturedLawyers(),
    getCategories(),
  ]);

  return (
    <div className="bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-slate-50 px-4 py-2 text-sm text-[#1E2A44]">
              <ShieldCheck className="size-4" />
              Юридическая платформа онлайн-бронирования
            </div>

            <h1 className="text-5xl font-bold leading-tight md:text-7xl">
              Найдите юриста
              <span className="block text-[#1E2A44]">за несколько минут</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-600">
              <span className="font-semibold tracking-tight text-[#1E2A44]">
                Pactum
              </span>{" "}
              — это платформа для бронирования юридических консультаций,
              безопасной оплаты и работы с проверенными юристами.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/catalog">
                <Button
                  size="lg"
                  className="bg-[#1E2A44] px-10 py-5 text-lg hover:bg-[#162033]"
                >
                  Перейти к услугам
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#1E2A44] px-10 py-5 text-lg text-[#1E2A44] hover:bg-[#1E2A44] hover:text-white"
                >
                  Стать юристом
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-[#1E2A44]/10 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
              <Image
                src="/images/lawyerhero.jpg"
                alt="Юридическая консультация"
                width={800}
                height={600}
                className="h-[500px] w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y bg-[#1E2A44] py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-8 px-6 text-center text-white">
          <div>
            <p className="text-4xl font-bold">{stats.lawyerCount}</p>
            <p className="mt-1 text-sm text-slate-300">Юристов</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{stats.serviceCount}</p>
            <p className="mt-1 text-sm text-slate-300">Услуг</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{stats.categoryCount}</p>
            <p className="mt-1 text-sm text-slate-300">Категорий</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold">
              Почему{" "}
              <span className="font-semibold tracking-tight text-[#1E2A44]">
                Pactum
              </span>
            </h2>
            <p className="mt-4 text-slate-600">
              Простая, безопасная и прозрачная платформа
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#1E2A44]/10 text-[#1E2A44]">
                <CalendarClock className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">Бронирование</h3>
              <p className="mt-3 text-slate-600">
                Выбирайте удобное время и записывайтесь к юристам онлайн
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#1E2A44]/10 text-[#1E2A44]">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">Безопасность</h3>
              <p className="mt-3 text-slate-600">
                Деньги переводятся юристу только после оказания услуги
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#1E2A44]/10 text-[#1E2A44]">
                <Star className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">Рейтинг</h3>
              <p className="mt-3 text-slate-600">
                Только реальные оценки от клиентов после завершения услуги
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Категории услуг</h2>
                <p className="mt-2 text-slate-600">
                  Выберите нужную область права
                </p>
              </div>
              <Link href="/catalog">
                <Button variant="ghost" className="gap-2 text-[#1E2A44]">
                  Все категории <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${cat.id}`}
                  className="group rounded-2xl border bg-white p-6 transition-all hover:border-[#1E2A44]/30 hover:shadow-md"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#1E2A44]/10 text-[#1E2A44]">
                    <Scale className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-[#1E2A44]">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {cat.description}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    {cat._count.services}{" "}
                    {cat._count.services === 1
                      ? "услуга"
                      : cat._count.services < 5
                        ? "услуги"
                        : "услуг"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LAWYERS */}
      {lawyers.length > 0 && (
        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Наши юристы</h2>
                <p className="mt-2 text-slate-600">
                  Квалифицированные специалисты на платформе
                </p>
              </div>
              <Link href="/lawyers">
                <Button variant="ghost" className="gap-2 text-[#1E2A44]">
                  Все юристы <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {lawyers.map((lawyer) => (
                <Link
                  key={lawyer.id}
                  href={`/lawyers/${lawyer.id}`}
                  className="group rounded-2xl border bg-white p-6 text-center transition-all hover:border-[#1E2A44]/30 hover:shadow-md"
                >
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#1E2A44] text-white">
                    {lawyer.image ? (
                      <Image
                        src={lawyer.image}
                        alt={lawyer.name}
                        width={64}
                        height={64}
                        className="size-16 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="size-7" />
                    )}
                  </div>
                  <h3 className="font-semibold group-hover:text-[#1E2A44]">
                    {lawyer.name}
                  </h3>
                  {lawyer.bio && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {lawyer.bio}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-400">
                    {lawyer._count.lawyerServices}{" "}
                    {lawyer._count.lawyerServices === 1
                      ? "услуга"
                      : lawyer._count.lawyerServices < 5
                        ? "услуги"
                        : "услуг"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-28">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-4xl font-bold">
            Начните пользоваться{" "}
            <span className="font-semibold tracking-tight text-[#1E2A44]">
              Pactum
            </span>
          </h2>
          <p className="mt-4 text-slate-600">
            Найдите юриста и получите консультацию онлайн
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/catalog">
              <Button
                size="lg"
                className="bg-[#1E2A44] px-10 py-5 text-lg hover:bg-[#162033]"
              >
                К услугам
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-[#1E2A44] px-10 py-5 text-lg text-[#1E2A44] hover:bg-[#1E2A44] hover:text-white"
              >
                Регистрация
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
