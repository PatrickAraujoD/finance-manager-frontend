export { default } from "next-auth/middleware";

export const config = {
  // Tudo exige sessao, exceto login, cadastro, rotas do NextAuth e arquivos estaticos.
  matcher: ["/((?!login|register|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
