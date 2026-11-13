import LegalPage from "@/components/templates/LegalPage";
import legal from "@/content/legal.json";

export default function TermsPage() {
  return <LegalPage title="Terms and Conditions" path="/terms-conditions" sections={legal["terms-conditions"]} />;
}
