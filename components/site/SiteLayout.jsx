import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import Seo from "@/components/site/Seo";
import { useT } from "@/lib/i18n";

export default function SiteLayout({ title, description, path, noindex, jsonLd, children }) {
  const t = useT();
  return (
    <>
      <Seo title={title} description={description} path={path} noindex={noindex} jsonLd={jsonLd} />
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("Skip to content")}
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
