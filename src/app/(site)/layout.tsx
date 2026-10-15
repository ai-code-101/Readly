import { SiteHeader } from "@/components/site-header";
import { TabBar } from "@/components/tab-bar";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
      {/* Bottom spacing; on phones it also leaves room for the tab bar. */}
      <div className="h-24 md:h-16" aria-hidden />
      <TabBar />
    </>
  );
}
