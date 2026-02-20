import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que usuário logado NÃO deve acessar
const authRoutes = new Set(["/signin", "/signup"]);

// Rotas que são públicas
const publicRoutes = new Set(["/"]);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Usuário LOGADO e tenta acessar /signin ou /signup, manda para Home
  if (authRoutes.has(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Rota é pública? Deixa acessar mesmo sem token
  if (publicRoutes.has(pathname)) {
    return NextResponse.next();
  }

  // Rota não é pública, é protegida e NÃO tem token
  if (!token && !authRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
