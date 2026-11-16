import PropertyListing from "@/components/templates/PropertyListing";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

export default function AgricultureLandPage() {
  return (
    <PropertyListing
      title="Agricultural Land for Sale"
      path="/agricultureland"
      headline="Agricultural land for sale."
      intro="Farmland with title verification, demarcation and conversion support from our team."
      presetType="Agriculture Land"
    />
  );
}
