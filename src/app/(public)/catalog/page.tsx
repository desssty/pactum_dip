// app/catalog/page.tsx
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CatalogClient } from "./catalog-client";

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

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/categories`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getServices(
  searchParams: Record<string, string | undefined>,
): Promise<ServicesResponse> {
  try {
    const params = new URLSearchParams();

    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    params.set("page", searchParams.page || "1");
    params.set("limit", "12");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/services?${params.toString()}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      return { services: [], total: 0, page: 1, totalPages: 1 };
    }

    return res.json();
  } catch {
    return { services: [], total: 0, page: 1, totalPages: 1 };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [categories, servicesData] = await Promise.all([
    getCategories(),
    getServices(params),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <CatalogClient
        initialCategories={categories}
        initialServices={servicesData.services}
        initialTotal={servicesData.total}
        initialTotalPages={servicesData.totalPages}
        initialPage={Number(params.page || "1")}
        initialSearch={params.search || ""}
        initialCategory={params.category || ""}
        initialMinPrice={params.minPrice || ""}
        initialMaxPrice={params.maxPrice || ""}
        initialSort={params.sort || "newest"}
      />
    </Suspense>
  );
}
