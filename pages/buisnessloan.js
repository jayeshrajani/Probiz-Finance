import ProductPage from "@/components/templates/ProductPage";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

export default function BuisnessloanPage() {
  return <ProductPage slug="buisnessloan" />;
}
