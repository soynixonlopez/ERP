import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const supabaseHost = (() => {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!u) return null;
  try {
    return new URL(u).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Evita que el bundler altere el paquete del escáner (getUserMedia / video).
  serverExternalPackages: ["html5-qrcode"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // camera=(self) permite el escáner QR en control de acceso; () lo bloqueaba por completo
            value: "camera=(self), microphone=(), geolocation=(), payment=()"
          }
        ]
      }
    ];
  },
  // Evita que Turbopack tome otro directorio si hay otro package-lock.json en carpetas padre.
  turbopack: {
    root: projectRoot
  },
  experimental: {
    // Sin esto, el cuerpo se trunca a ~10 MB al clonar la request (middleware/proxy)
    // y las subidas multipart a Server Actions fallan con "Unexpected end of form".
    proxyClientMaxBodySize: "25mb",
    serverActions: {
      bodySizeLimit: "25mb"
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**"
            }
          ]
        : [])
    ]
  }
};

export default nextConfig;
