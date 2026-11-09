import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  // O navegador chama /backend/*, e o Next repassa para a API. Assim o backend nao precisa de CORS.
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
