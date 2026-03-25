import type { Metadata } from "next";
import "@/app/globals.css";

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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
