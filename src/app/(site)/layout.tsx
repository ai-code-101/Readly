import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TabBar } from "@/components/tab-bar";
import { getCategories } from "@/lib/api";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const categories = await getCategories().catch(() => []);
  return (
    <>
      <SiteHeader categories={categories} />
      {children}
      <SiteFooter />
      <TabBar />
    </>
  );
}
