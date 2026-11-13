exports.ppfCalculator = async(req,res)=>{
    try {
        const { annualDeposit, annualInterestRate, tenure } = req.body;

        // Validate input
        if (!annualDeposit || !annualInterestRate || !tenure) {
            return res.status(400).json({ error: 'Please provide all required fields: annualDeposit, annualInterestRate, tenure' });
        }

        // Convert tenure to years (already in years)
        const investmentTerm = tenure;

        // Convert annual interest rate to decimal
        const monthlyInterestRate = annualInterestRate / 12 / 100;

        // Calculate maturity amount
        let maturityAmount = 0;
        let totalInterestEarned = 0;
        let currentBalance = 0;

        for (let year = 1; year <= investmentTerm; year++) {
            // Add annual deposit to current balance at the beginning of each year
            currentBalance += annualDeposit;

            // Calculate interest earned for the year
            const annualInterest = currentBalance * monthlyInterestRate * 12;

            // Add interest to current balance at the end of each year
            currentBalance += annualInterest;

            // Track total interest earned
            totalInterestEarned += annualInterest;
        }

        // Maturity amount is the total balance at the end of investment term
        maturityAmount = currentBalance;

        // Send response
        return res.status(200).json({
            annualDeposit,
            annualInterestRate,
            tenure,
            maturityAmount: Math.floor(maturityAmount), // Rounded to 2 decimal places
            totalInterestEarned: Math.floor(totalInterestEarned), // Rounded to 2 decimal places
            message: 'Success'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}