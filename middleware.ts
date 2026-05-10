import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!session;
  const role = session?.user?.role;

  // /login — redireciona se já autenticado
  if (pathname === "/login") {
    if (isLoggedIn) {
      const dest = role === "admin" ? "/admin" : "/painel";
      return NextResponse.redirect(new URL(dest, nextUrl));
    }
    return NextResponse.next();
  }

  // /admin/* — apenas admins
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/painel", nextUrl));
    }
    return NextResponse.next();
  }

  // /painel/* — apenas clients
  if (pathname.startsWith("/painel")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "client") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/painel/:path*",
  ],
};
