import Head from "next/head";
import { useLocale, useT } from "@/lib/i18n";
import { site } from "@/lib/site";
import contact from "@/content/site-settings.json";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  logo: `${site.url}/brand/probiz-logo.png`,
  telephone: `+91${contact.primaryPhone}`,
  email: contact.contactEmail,
  foundingDate: String(site.since),
  areaServed: "IN",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1003 Skye Corporate Park, AB Rd, Sector C, Slice 5, Part 2, Scheme 78, Vijay Nagar",
    addressLocality: "Indore",
    addressRegion: "Madhya Pradesh",
    postalCode: "452010",
    addressCountry: "IN",
  },
  hasMap: site.mapLink,
  sameAs: Object.values(contact.social).filter(Boolean),
};

// `<` is escaped so page content can never close the script tag.
export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function Seo({ title, description, path = "", noindex = false, jsonLd, image = "/og-image.png" }) {
  const t = useT();
  const locale = useLocale();
  const fullTitle = title ? `${t(title)} | ${site.name}` : `${site.name} | ${t("Loans, Insurance and Investments Across India")}`;
  const desc = t(description || site.description);
  const at = (l) => `${site.url}${l === "hi" ? "/hi" : ""}${path}`;
  const url = at(locale);
  const img = `${site.url}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={site.name} />
      {process.env.NEXT_PUBLIC_FB_APP_ID && <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FB_APP_ID} />}
      <meta property="og:locale" content={locale === "hi" ? "hi_IN" : "en_IN"} />
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={img} />
      {!noindex && <link rel="canonical" href={url} />}
      {!noindex && <link rel="alternate" hrefLang="en-IN" href={at("en")} />}
      {!noindex && <link rel="alternate" hrefLang="hi-IN" href={at("hi")} />}
      {!noindex && <link rel="alternate" hrefLang="x-default" href={at("en")} />}
      {jsonLd && <JsonLd data={jsonLd} />}
    </Head>
  );
}
