import IdvCalculator from "@/components/calculators/IdvCalculator";
import CalculatorPage from "@/components/templates/CalculatorPage";

export default function IdvCalculatorPage() {
  return (
    <CalculatorPage
      slug="idvcalculator"
      title="IDV Calculator"
      description="Calculate your car or bike's Insured Declared Value (IDV) using the IRDAI depreciation schedule."
      headline="What will your insurer cover?"
      intro="Your Insured Declared Value is the most your insurer pays if the vehicle is stolen or written off."
      note="IDV = (ex-showroom price + fitted accessories) minus age-based depreciation. Registration and insurance costs are not included."
    >
      <IdvCalculator />
    </CalculatorPage>
  );
}
