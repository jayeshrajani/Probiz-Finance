

// Function to round values according to the rules specified
const customRound = (value) => {
    return (value % 1) >= 0.5 ? Math.ceil(value) : Math.floor(value);
};

// Helper function to get the year and month
const getYearMonth = (startYear, startMonth, offset) => {
    const date = new Date(startYear, startMonth - 1 + offset);
    return {
        year: date.getFullYear(),
        month: date.toLocaleString('default', { month: 'long' })
    };
};

exports.homeLoanCalculator = async(req,res)=>{
    const { principal, annualInterestRate, tenureYears } = req.body;

    if (!principal || !annualInterestRate || !tenureYears) {
        return res.status(400).json({ error: 'Please provide all required fields: principal, annualInterestRate, tenureYears' });
    }

    // Convert annual interest rate to monthly and tenure in years to months
    const monthlyInterestRate = annualInterestRate / (12 * 100);
    const numberOfMonths = tenureYears * 12;

    // EMI calculation formula
    const emi = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths)) / 
                (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

    let remainingPrincipal = principal;
    const amortizationSchedule = [];

    const startYear = new Date().getFullYear();
    const startMonth = new Date().getMonth() + 1; // getMonth() returns 0-based month

    for (let month = 1; month <= numberOfMonths; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = emi - interestForMonth;
        remainingPrincipal -= principalForMonth;

        const { year, month: paymentMonth } = getYearMonth(startYear, startMonth, month - 1);

        amortizationSchedule.push({
            year,
            month: paymentMonth,
            principalForMonth: customRound(principalForMonth),
            interestForMonth: customRound(interestForMonth),
            emi: customRound(emi),
            remainingPrincipal: customRound(remainingPrincipal)
        });
    }

    // Calculate total payable amount and interest amount
    const totalPayable = Math.ceil(emi) * numberOfMonths;
    const interestAmount = totalPayable - principal;

    res.json({
        principal: customRound(principal),
        interestAmount: customRound(interestAmount),
        totalPayable: customRound(totalPayable),
        emi: customRound(emi),
        amortizationSchedule
    });
}