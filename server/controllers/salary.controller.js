exports.salaryCalculator = async(req,res)=>{
    const {
        annualCTC,
        bonus,
        monthlyProfessionalTax,
        monthlyEmployerPF,
        monthlyEmployeePF,
        monthlyAdditionalDeduction = 0,
        otherDeductions = 0
    } = req.body;

    // Validate required input fields
    if (
        !annualCTC || isNaN(annualCTC) ||
        !bonus || isNaN(bonus) ||
        !monthlyProfessionalTax || isNaN(monthlyProfessionalTax) ||
        !monthlyEmployerPF || isNaN(monthlyEmployerPF) ||
        !monthlyEmployeePF || isNaN(monthlyEmployeePF)
    ) {
        return res.status(400).json({ error: 'All required fields must be valid numbers.' });
    }

    let monthlyBonus = bonus/12;

    console.log("monthlyBonus",monthlyBonus)

    // Calculate total monthly deductions
    const totalMonthlyDeductions = monthlyProfessionalTax + monthlyEmployerPF + monthlyEmployeePF + monthlyAdditionalDeduction + otherDeductions+monthlyBonus;

    // Calculate total annual deductions
    const totalAnnualDeductions = totalMonthlyDeductions * 12  ;

    // Calculate take-home annual and monthly salary
    const takeHomeAnnualSalary = annualCTC  - totalAnnualDeductions;
    const takeHomeMonthlySalary = takeHomeAnnualSalary / 12;

    res.json({
        totalMonthlyDeductions: Math.floor(totalMonthlyDeductions),
        totalAnnualDeductions: Math.floor(totalAnnualDeductions),
        takeHomeAnnualSalary: Math.floor(takeHomeAnnualSalary),
        takeHomeMonthlySalary: Math.floor(takeHomeMonthlySalary)
    });
}