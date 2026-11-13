import LegalPage from "@/components/templates/LegalPage";
import legal from "@/content/legal.json";

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" path="/privacy-policy" sections={legal["privacy-policy"]} />;
}
