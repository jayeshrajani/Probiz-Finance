import ProductPage from "@/components/templates/ProductPage";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

export default function CarloanfundingPage() {
  return <ProductPage slug="carloanfunding" />;
}
