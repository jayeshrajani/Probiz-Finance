import LegalPage from "@/components/templates/LegalPage";
import legal from "@/content/legal.json";
import { localePropsWith } from "@/lib/i18n-static";

export const getStaticProps = localePropsWith("legal");

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" path="/privacy-policy" sections={legal["privacy-policy"]} />;
}
