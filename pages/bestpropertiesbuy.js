import PropertyListing from "@/components/templates/PropertyListing";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

export default function BestPropertiesBuyPage() {
  return <PropertyListing title="Properties to Buy" path="/bestpropertiesbuy" />;
}
