import PropertyListing from "@/components/templates/PropertyListing";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

export default function PropertyPage() {
  return <PropertyListing />;
}
