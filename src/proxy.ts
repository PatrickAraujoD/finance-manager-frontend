import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

/** Checagem otimista: so confere se existe sessao. A API valida o token de verdade. */
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  if (token && !token.error) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  // Tudo exige sessao, exceto login, cadastro, rotas do NextAuth e arquivos estaticos.
  matcher: ["/((?!login|register|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
