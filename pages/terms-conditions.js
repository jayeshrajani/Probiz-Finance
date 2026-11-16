import LegalPage from "@/components/templates/LegalPage";
import legal from "@/content/legal.json";
import { localePropsWith } from "@/lib/i18n-static";

export const getStaticProps = localePropsWith("legal");

export default function TermsPage() {
  return <LegalPage title="Terms and Conditions" path="/terms-conditions" sections={legal["terms-conditions"]} />;
}
