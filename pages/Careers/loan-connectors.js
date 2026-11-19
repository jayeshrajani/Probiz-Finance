import CareerProgrammePage from "@/components/templates/CareerProgrammePage";
import { localePropsWith } from "@/lib/i18n-static";

export const getStaticProps = localePropsWith("company");

export default function LoanConnectorsPage() {
  return <CareerProgrammePage slug="loan-connectors" />;
}
