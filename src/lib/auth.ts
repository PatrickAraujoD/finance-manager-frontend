import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Profile, TokenPair } from "./api-types";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

/** Renova o access token 60 s antes de ele vencer. */
const REFRESH_MARGIN_MS = 60_000;

/** O backend rotaciona o refresh token: reusar um token ja trocado revoga a sessao inteira. */
const REUSE_WINDOW_MS = 30_000;

function tokenExpiry(accessToken: string): number {
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString());
    return typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 14 * 60_000;
  } catch {
    return Date.now() + 14 * 60_000;
  }
}

async function postJson<T>(path: string, body: unknown): Promise<{ status: number; data: T | null }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = res.ok ? ((await res.json().catch(() => null)) as T | null) : null;
  return { status: res.status, data };
}

// Varias requisicoes de sessao chegam juntas (abas, SWR). Todas trazem o mesmo refresh token
// antigo no cookie, entao dividimos a mesma troca entre elas em vez de gastar o token duas vezes.
const inflight = new Map<string, Promise<TokenPair | null>>();

function rotateTokens(refreshToken: string): Promise<TokenPair | null> {
  const existing = inflight.get(refreshToken);
  if (existing) return existing;

  const attempt = postJson<TokenPair>("/auth/refresh", { refreshToken })
    .then(({ data }) => data)
    .catch(() => null);
  inflight.set(refreshToken, attempt);
  setTimeout(() => inflight.delete(refreshToken), REUSE_WINDOW_MS).unref?.();
  return attempt;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const pair = await rotateTokens(token.refreshToken);
  if (!pair) return { ...token, error: "RefreshAccessTokenError" };
  return {
    ...token,
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    accessTokenExpires: tokenExpiry(pair.accessToken),
    error: undefined,
  };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const login = await postJson<TokenPair>("/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });
        if (login.status === 429) throw new Error("RATE_LIMITED");
        if (!login.data) return null;

        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${login.data.accessToken}` },
          cache: "no-store",
        });
        if (!meRes.ok) return null;
        const me = (await meRes.json()) as Profile;

        return {
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          accessToken: login.data.accessToken,
          refreshToken: login.data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: tokenExpiry(user.accessToken),
        };
      }
      if (token.error) return token;
      if (Date.now() < token.accessTokenExpires - REFRESH_MARGIN_MS) return token;
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (!token?.refreshToken) return;
      await postJson("/auth/logout", { refreshToken: token.refreshToken }).catch(() => undefined);
    },
  },
};
