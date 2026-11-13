exports.rdCalculator = async(req,res)=>{
    try {
        const { monthlyDeposit, annualInterestRate, tenureYears } = req.body;

        // Validate input
        if (monthlyDeposit === undefined || annualInterestRate === undefined || tenureYears === undefined) {
            return res.status(400).json({ error: 'Please provide all required fields: monthlyDeposit, annualInterestRate, tenureYears' });
        }

        const tenureMonths = tenureYears * 12;
        const monthlyInterestRate = annualInterestRate / 12 / 100;
   const A = 5000 * Math.pow(1 + 0.07 / 12, 12 * 36);
   console.log("A",A)
        // Calculate maturity amount using the RD formula
        let maturityAmount = 0;
        for (let month = 1; month <= tenureMonths; month++) {
            maturityAmount += monthlyDeposit * Math.pow(1 + monthlyInterestRate, tenureMonths - month + 1);
        }

        // Round the maturity amount to the nearest integer
        maturityAmount = Math.round(maturityAmount);

        // Send response
        return res.status(200).json({
            monthlyDeposit,
            annualInterestRate,
            tenureYears,
            maturityAmount: maturityAmount.toFixed(2), // Rounded to 2 decimal places
            message: 'Success'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}
