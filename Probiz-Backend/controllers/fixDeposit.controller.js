exports.fixedDepositCalculator = async (req, res) => {
    try {
        const { principal, interestRate, tenure } = req.body;

        // Validate input
        if (!principal || !interestRate || !tenure) {
            return res.status(400).json({ error: 'Please provide all required fields: principal, interestRate, tenure' });
        }

        // Convert tenure from years to months
        const tenureMonths = tenure * 12;

        // Convert interest rate to decimal
        const monthlyInterestRate = interestRate / 12 / 100;

        // Calculate maturity amount
        let maturityAmount = principal * Math.pow(1 + monthlyInterestRate, tenureMonths);
console.log("maturityAmount",maturityAmount)
        // Round up to the nearest whole number
        maturityAmount = Math.floor(maturityAmount);
        let wealthGained = maturityAmount-principal;
        // Send response
        return res.status(200).json({
            principal,
            wealthGained,
            // Sending back the input tenure in years
            maturityAmount: maturityAmount, // Rounded to 2 decimal places
            message: 'Success'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
