import Head from "next/head";
import { site } from "@/lib/site";

export default function Seo({ title, description, path = "" }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | Business and Asset Loan Experts in Indore`;
  const desc = description || site.description;
  const url = `${site.url}${path}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={site.name} />
      <link rel="canonical" href={url} />
    </Head>
  );
}
