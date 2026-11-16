import PropertyListing from "@/components/templates/PropertyListing";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

export default function BestCommercialPropertyPage() {
  return (
    <PropertyListing
      title="Commercial Property for Sale"
      path="/bestcommercialproperty"
      headline="Shops, offices and showrooms."
      intro="Commercial property for sale, with purchase loans of up to 80% of value."
      presetType="Commercial Property"
    />
  );
}
