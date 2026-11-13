import EligibilityCalculator from "@/components/calculators/EligibilityCalculator";
import CalculatorPage from "@/components/templates/CalculatorPage";

export default function EligibilityPage() {
  return (
    <CalculatorPage
      slug="eligibility"
      title="Loan Eligibility Calculator"
      description="Find out how much you could borrow based on your monthly income, existing EMIs, interest rate and tenure."
      headline="How much could you borrow?"
      intro="Enter your income and current EMIs. We'll estimate the loan amount most lenders would consider."
      note="This is an estimate, not an offer. Final eligibility depends on the lender's assessment of your credit history, age, employment and property."
    >
      <EligibilityCalculator />
    </CalculatorPage>
  );
}
