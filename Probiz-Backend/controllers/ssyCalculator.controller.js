exports.sukanyaSamriddhiYojna = async(req,res)=>{
    const { yearlyInvestment, girlAge, startYear } = req.body;

    // Validate input
    if (!yearlyInvestment || !girlAge || !startYear || girlAge >= 10) {
        return res.status(400).json({ error: 'Invalid input. Make sure all fields are valid and the girl\'s age is less than 10 years.' });
    }

    const interestRate = 0.082; // 8.2% annual interest rate
    const investmentPeriod = 15; // 15 years of investment
    const maturityPeriod = 21; // 21 years total maturity period
    let totalAmount = 0;

    // Calculate amount for each year during the investment period
    for (let year = 0; year < investmentPeriod; year++) {
        totalAmount += yearlyInvestment;
        totalAmount += totalAmount * interestRate;
    }

    // Calculate amount for each year during the post-investment period
    for (let year = investmentPeriod; year < maturityPeriod; year++) {
        totalAmount += totalAmount * interestRate;
    }

    let totalInvestment = yearlyInvestment*15;
    res.json({
        totalInterest:Math.floor(totalAmount),
        totalAccumulatedAmount: totalInvestment+Math.floor(totalAmount),
        totalInvestment:totalInvestment,
        maturityYear: startYear + maturityPeriod
    });
}