import ServicePage from "@/components/templates/ServicePage";
import { localePropsWith } from "@/lib/i18n-static";

export const getStaticProps = localePropsWith("services");

export default function GovernmentBusinessServicesPage() {
  return <ServicePage slug="government-business-services" />;
}
