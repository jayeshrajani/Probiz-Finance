import SipCalculator from "@/components/calculators/SipCalculator";
import CalculatorPage from "@/components/templates/CalculatorPage";

export default function SipCalculatorPage() {
  return (
    <CalculatorPage
      slug="sipcalculator"
      title="SIP Calculator"
      description="Estimate what a monthly SIP could grow to over time at an expected rate of return."
      headline="See what a monthly SIP could become."
      intro="Choose how much you'd invest each month, for how long, and the return you expect."
      note="Calculated monthly with contributions at the start of each month. Mutual fund investments are subject to market risks; read all scheme documents carefully."
    >
      <SipCalculator />
    </CalculatorPage>
  );
}
