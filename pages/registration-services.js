import ServicePage from "@/components/templates/ServicePage";
import { localePropsWith } from "@/lib/i18n-static";

export const getStaticProps = localePropsWith("services");

export default function RegistrationServicesPage() {
  return <ServicePage slug="registration-services" />;
}
