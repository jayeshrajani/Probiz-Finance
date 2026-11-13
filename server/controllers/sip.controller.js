exports.sipCalculator = async (req, res) => {
    try {
        const { monthlyInvestment, annualInterestRate, years } = req.body;

        // Check if the required fields are provided
        if (monthlyInvestment === undefined || annualInterestRate === undefined || years === undefined) {
            return res.status(400).json({ error: 'Please provide all required fields: monthlyInvestment, annualInterestRate, years' });
        }

        const months = years * 12;
        const monthlyInterestRate = annualInterestRate / 12 / 100;

        let futureValue = 0;
        let investedAmount = 0;
        let yearlyBreakdown = [];

        for (let month = 1; month <= months; month++) {
            futureValue = (futureValue + monthlyInvestment) * (1 + monthlyInterestRate);
            investedAmount += monthlyInvestment;

            if (month % 12 === 0) {
                const year = month / 12;
                const wealthGained = futureValue - investedAmount;
                yearlyBreakdown.push({
                    year: new Date().getFullYear() + year,
                    investedAmount: Math.ceil(investedAmount),
                    wealthGained: Math.ceil(wealthGained),
                    expectedAmount: Math.ceil(futureValue)
                });
            }
        }

        futureValue = Math.ceil(futureValue);
        let investValue = monthlyInvestment * months;
        let profitValue = Math.ceil(futureValue - investValue);

        return res.status(200).send({
            investValue: Math.ceil(investValue),
            profitValue,
            futureValue,
            yearlyBreakdown,
            message: "Success",
            status: 200
        });
    } catch (error) {
        return res.status(500).send({ message: error.message, status: 500 });
    }
};
