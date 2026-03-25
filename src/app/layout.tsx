import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "EPR Reservas",
  description: "Plataforma multi-tenant de reservas de eventos y paquetes."
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
        <main className="mx-auto min-h-[calc(100vh-128px)] w-full max-w-7xl px-4 py-8 md:px-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
