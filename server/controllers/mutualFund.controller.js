exports.mutualFundOneTimeInvestment = async(req,res)=>{
    try {
        const { initialInvestment, annualInterestRate, tenure } = req.body;

        // Validate input
        if (initialInvestment === undefined || annualInterestRate === undefined || tenure === undefined) {
            return res.status(400).json({ error: 'Please provide all required fields: initialInvestment, annualInterestRate, tenure' });
        }

        // Convert tenure to years (already in years)
        const investmentTerm = tenure;

        // Convert annual interest rate to decimal
        const annualInterestRateDecimal = annualInterestRate / 100;

        // Calculate future value of the mutual fund investment
        const futureValue = initialInvestment+initialInvestment * Math.pow(1 + annualInterestRateDecimal, investmentTerm);

        // Calculate total interest earned
        const totalInterestEarned = futureValue - initialInvestment;

        // Send response
        return res.status(200).json({
            initialInvestment,
            annualInterestRate,
            tenure,
            futureValue: Math.floor(futureValue), // Rounded to 2 decimal places
            totalInterestEarned: Math.floor(totalInterestEarned), // Rounded to 2 decimal places
            message: 'Success'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}