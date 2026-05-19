import type { NextConfig } from "next";

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

const securityHeaders = [
  // Fuerza HTTPS por 2 años
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Evita que el navegador adivine el tipo de archivo (previene ataques MIME)
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Bloquea que tu app se cargue dentro de un iframe de otro sitio (anti-clickjacking)
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Controla qué información del usuario se envía al navegar a otros sitios
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Desactiva permisos de hardware que la app no usa
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // Desactiva el inspector XSS del navegador (los modernos no lo necesitan y puede causar bugs)
  {
    key: "X-XSS-Protection",
    value: "0",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: allowedOrigins.join(","),
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, x-signature",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
