// app/catalog/catalog-client.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  SlidersHorizontal,
  Star,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Category = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
  createdAt: string;
  avgRating: number | null;
  ratingsCount: number;
  category: {
    id: string;
    name: string;
  };
  lawyer: {
    id: string;
    name: string;
    image: string | null;
  };
};

type ServicesResponse = {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
};

type Props = {
  initialCategories: Category[];
  initialServices: Service[];
  initialTotal: number;
  initialTotalPages: number;
  initialPage: number;
  initialSearch: string;
  initialCategory: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  initialSort: string;
};

const SORT_LABELS: Record<string, string> = {
  newest: "Сначала новые",
  oldest: "Сначала старые",
  price_asc: "Цена по возрастанию",
  price_desc: "Цена по убыванию",
  title_asc: "По алфавиту",
  rating_desc: "Сначала высокий рейтинг",
  rating_asc: "Сначала низкий рейтинг",
};

export function CatalogClient({
  initialCategories,
  initialServices,
  initialTotal,
  initialTotalPages,
  initialPage,
  initialSearch,
  initialCategory,
  initialMinPrice,
  initialMaxPrice,
  initialSort,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [categories] = useState<Category[]>(initialCategories);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (sort) params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/services?${params.toString()}`);
      const data: ServicesResponse = await res.json();

      setServices(data.services || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Ошибка загрузки услуг", error);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const timeout = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchServices]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    router.replace(`/catalog${query ? `?${query}` : ""}`, { scroll: false });
  }, [search, category, minPrice, maxPrice, sort, page, router]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    !!search || !!category || !!minPrice || !!maxPrice || sort !== "newest";

  const selectedCategory = categories.find((c) => c.id === category);

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(Number(price));

  const filtersContent = (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Категория
        </label>
        <Select
          value={category || "all"}
          onValueChange={(value) => {
            setCategory(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {category
                ? (categories.find((c) => c.id === category)?.name ??
                  "Все категории")
                : "Все категории"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Цена от
        </label>
        <Input
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value);
            setPage(1);
          }}
          placeholder="Например, 1000"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Цена до
        </label>
        <Input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setPage(1);
          }}
          placeholder="Например, 5000"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Сортировка
        </label>
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{SORT_LABELS[sort] ?? "Сначала новые"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={resetFilters}>
        Сбросить фильтры
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Шапка ── */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <h1 className="text-2xl font-bold sm:text-4xl">Каталог услуг</h1>
          <p className="mt-1 text-sm text-slate-600 sm:mt-2 sm:text-base">
            Найдите подходящую юридическую услугу
          </p>

          <div className="mt-4 flex gap-2 sm:mt-6 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Поиск по услугам..."
                className="h-10 pl-10 pr-10 sm:h-11"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* ── Мобильные фильтры ── */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger
                className={[
                  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center",
                  "rounded-lg border border-input bg-background text-sm font-medium",
                  "shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "sm:h-11 sm:w-11 lg:hidden",
                ].join(" ")}
              >
                <SlidersHorizontal className="size-4" />
                {hasActiveFilters && (
                  <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-blue-600" />
                )}
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex w-[85vw] max-w-[420px] flex-col overflow-y-auto"
              >
                {/* ── Внутренний контейнер с отступами ── */}
                <div className="flex flex-1 flex-col px-5 py-6 sm:px-6 sm:py-8">
                  <SheetHeader className="mb-6 px-0">
                    <SheetTitle className="text-xl font-bold">
                      Фильтры
                    </SheetTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      Настройте параметры поиска
                    </p>
                  </SheetHeader>

                  {/* Блок фильтров с отступами */}
                  <div className="flex-1">{filtersContent}</div>

                  {/* Кнопка «Показать» */}
                  <div className="mt-8 border-t pt-5">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className={[
                        "inline-flex w-full items-center justify-center rounded-lg",
                        "bg-[#1E2A44] px-4 py-3 text-sm font-medium text-white",
                        "hover:bg-[#162033] focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-ring transition-colors",
                      ].join(" ")}
                    >
                      Показать результаты
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Активные фильтры — бейджи */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                  {selectedCategory.name}
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("");
                      setPage(1);
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              {(minPrice || maxPrice) && (
                <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                  {minPrice ? `от ${minPrice} ₽` : ""}
                  {minPrice && maxPrice ? " " : ""}
                  {maxPrice ? `до ${maxPrice} ₽` : ""}
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                      setPage(1);
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              {sort !== "newest" && (
                <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                  {SORT_LABELS[sort]}
                  <button
                    type="button"
                    onClick={() => {
                      setSort("newest");
                      setPage(1);
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm"
                onClick={resetFilters}
              >
                Сбросить всё
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Основной контент ── */}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row">
        {/* Боковые фильтры — только десктоп */}
        <aside className="hidden w-full shrink-0 self-start rounded-xl border bg-white p-6 shadow-sm lg:block lg:max-w-[280px]">
          <h2 className="mb-4 text-lg font-semibold">Фильтры</h2>
          {filtersContent}
        </aside>

        {/* Контент — сетка карточек */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 text-sm text-slate-600 sm:mb-6">
            Найдено:{" "}
            <span className="font-semibold text-slate-900">{total}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="size-8 animate-spin text-slate-400" />
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border bg-white py-16 text-center sm:py-20">
              <h3 className="text-lg font-semibold sm:text-xl">
                Услуги не найдены
              </h3>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Попробуйте изменить параметры поиска
              </p>
              <Button className="mt-4" variant="outline" onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {services.map((service) => (
                  <Link key={service.id} href={`/services/${service.id}`}>
                    <Card className="h-full transition-all hover:border-[#1E2A44]/30 hover:shadow-md">
                      <CardContent className="flex h-full flex-col p-4 sm:p-6">
                        <Badge
                          variant="secondary"
                          className="mb-2 w-fit text-xs sm:mb-3"
                        >
                          {service.category.name}
                        </Badge>

                        <h3 className="text-base font-semibold leading-snug sm:text-lg">
                          {service.title}
                        </h3>

                        <p className="mt-1.5 line-clamp-3 flex-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
                          {service.description}
                        </p>

                        <div className="mt-3 flex items-center gap-3 sm:mt-4">
                          {service.avgRating ? (
                            <div className="flex items-center gap-1 text-xs sm:text-sm">
                              <Star className="size-3.5 fill-yellow-400 text-yellow-400 sm:size-4" />
                              <span className="font-medium">
                                {service.avgRating}
                              </span>
                              <span className="text-slate-400">
                                ({service.ratingsCount})
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 sm:text-sm">
                              Нет отзывов
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t pt-3 sm:mt-4 sm:pt-4">
                          <div className="flex items-center gap-2">
                            {service.lawyer.image ? (
                              <Image
                                src={service.lawyer.image}
                                alt={service.lawyer.name}
                                width={28}
                                height={28}
                                className="size-6 rounded-full object-cover sm:size-7"
                              />
                            ) : (
                              <div className="flex size-6 items-center justify-center rounded-full bg-[#1E2A44] text-white sm:size-7">
                                <User className="size-3 sm:size-4" />
                              </div>
                            )}
                            <span className="max-w-[90px] truncate text-xs text-slate-600 sm:max-w-[120px] sm:text-sm">
                              {service.lawyer.name}
                            </span>
                          </div>

                          <span className="text-base font-bold text-[#1E2A44] sm:text-lg">
                            {formatPrice(service.price)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-1 sm:mt-8 sm:gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 sm:size-9"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                    )
                    .map((p, index, arr) => (
                      <span key={p} className="flex items-center">
                        {index > 0 && arr[index - 1] !== p - 1 && (
                          <span className="px-1 text-sm text-slate-400 sm:px-2">
                            ...
                          </span>
                        )}
                        <Button
                          variant={p === page ? "default" : "outline"}
                          className={`size-8 text-xs sm:size-9 sm:text-sm ${
                            p === page ? "bg-[#1E2A44] hover:bg-[#162033]" : ""
                          }`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      </span>
                    ))}

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 sm:size-9"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
