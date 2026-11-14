import Head from "next/head";
import { site } from "@/lib/site";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  logo: `${site.url}/brand/probiz-logo.png`,
  telephone: `+91${site.phone}`,
  email: site.email,
  foundingDate: String(site.since),
  areaServed: "IN",
  address: {
    "@type": "PostalAddress",
    streetAddress: "709, Clifton Corporate",
    addressLocality: "Indore",
    addressRegion: "Madhya Pradesh",
    addressCountry: "IN",
  },
  sameAs: Object.values(site.socials),
};

// `<` is escaped so page content can never close the script tag.
export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function Seo({ title, description, path = "", noindex = false, jsonLd }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | Loans, Insurance and Investments Across India`;
  const desc = description || site.description;
  const url = `${site.url}${path}`;

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
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content="summary" />
      {!noindex && <link rel="canonical" href={url} />}
      {jsonLd && <JsonLd data={jsonLd} />}
    </Head>
  );
}
