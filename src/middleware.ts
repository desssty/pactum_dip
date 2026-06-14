import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // защита админки
  if (pathname.startsWith("/admin")) {
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // защита профиля клиента
  if (pathname.startsWith("/client")) {
    if (!user || user.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // защита кабинета юриста
  if (pathname.startsWith("/lawyer/dashboard")) {
    if (!user || user.role !== "LAWYER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/lawyer/dashboard/:path*"],
};
