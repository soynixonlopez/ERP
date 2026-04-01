import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-main"
});

export const metadata: Metadata = {
  title: "EPR Reservas",
  description: "Plataforma multi-tenant de reservas de eventos y paquetes.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg"
  }
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
