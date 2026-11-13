exports.carLoanEMICalculator = async (req, res) => {
    try {
        const { principal, annualInterestRate, years } = req.body;

        // Check if the required fields are provided
        if (principal === undefined || annualInterestRate === undefined || years === undefined) {
            return res.status(400).json({ error: 'Please provide all required fields: principal, annualInterestRate, years' });
        }

        const months = years * 12;
        const monthlyInterestRate = annualInterestRate / 12 / 100;

        // Calculate EMI
        const emi = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) / (Math.pow(1 + monthlyInterestRate, months) - 1);
        console.log(emi,months)
        const totalPayment = Math.floor(emi) * months;
        console.log("totalPayment",totalPayment)
        const totalInterest = totalPayment - principal;

        // Round up to the nearest whole number
        const roundedEMI = Math.floor(emi);
        const roundedTotalPayment = Math.floor(totalPayment);
        const roundedTotalInterest = Math.floor(totalInterest);
        const roundedPrincipal = Math.floor(principal);

        return res.status(200).send({
            emi: roundedEMI,
            totalPayment: roundedTotalPayment,
            totalInterest: roundedTotalInterest,
            principal: roundedPrincipal,
            message: "Success",
            status: 200
        });
    } catch (error) {
        return res.status(500).send({ message: error.message, status: 500 });
    }
};
