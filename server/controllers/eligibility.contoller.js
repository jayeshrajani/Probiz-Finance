// API Endpoint for Checking Eligibility
exports.eligibilityCalculator = async (req, res) => {
  const { grossIncome, tenure, interestRate } = req.body;

  if (!grossIncome || !tenure || !interestRate) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const maxEMIRatio = 0.4; // Assume 40% of income can be used for EMI
  const maxEligibleEMI = grossIncome * maxEMIRatio;
  const months = tenure * 12;
  const monthlyInterestRate = interestRate / (12 * 100);

  const emi = (grossIncome * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) / 
              (Math.pow(1 + monthlyInterestRate, months) - 1);

  const maxLoanAmount = (maxEligibleEMI * (Math.pow(1 + monthlyInterestRate, months) - 1)) / 
                        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months));

  res.json({
    maxEligibleEMI: maxEligibleEMI.toFixed(2),
    maxLoanAmount: maxLoanAmount.toFixed(2),
    message: emi <= maxEligibleEMI ? "Eligible for loan." : "Not eligible for loan."
  });
}