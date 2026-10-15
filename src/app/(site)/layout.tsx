import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TabBar } from "@/components/tab-bar";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      {/* Room for the bottom tab bar on phones (the footer is hidden there). */}
      <div className="h-24 md:hidden" aria-hidden />
      <TabBar />
    </>
  );
}
