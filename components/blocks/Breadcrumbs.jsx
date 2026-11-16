import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { JsonLd } from "@/components/site/Seo";
import { useLocale, useT } from "@/lib/i18n";
import { site } from "@/lib/site";

export default function Breadcrumbs({ items }) {
  const t = useT();
  const prefix = useLocale() === "hi" ? "/hi" : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t(item.label),
      ...(item.href ? { item: `${site.url}${prefix}${item.href === "/" ? "" : item.href}` } : {}),
    })),
  };
  return (
    <nav aria-label={t("Breadcrumb")}>
      <JsonLd data={jsonLd} />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <CaretRight weight="bold" aria-hidden className="size-3 opacity-60" />}
            {item.href ? (
              <Link href={item.href} className="-my-2.5 inline-block py-2.5 hover:text-foreground">
                {t(item.label)}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground/80">
                {t(item.label)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
