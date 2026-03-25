import { SiteHeader } from "@/components/layout/site-header";
import { ConditionalSiteFooter } from "@/components/layout/conditional-site-footer";

type SiteLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function SiteLayout({ children }: SiteLayoutProps): JSX.Element {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[calc(100vh-5rem)] w-full min-w-0 max-w-7xl px-3 py-6 sm:min-h-[calc(100vh-5.75rem)] sm:px-4 sm:py-8 md:px-6">
        {children}
      </main>
      <ConditionalSiteFooter />
    </>
  );
}
