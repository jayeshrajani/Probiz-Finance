exports.gstCalculator = async(req,res)=>{
    try {
        const { amountExcludingGST, gstRate } = req.body;

        if (!amountExcludingGST || !gstRate || isNaN(amountExcludingGST) || isNaN(gstRate)) {
            return res.status(400).json({ error: 'Invalid input. Please provide valid amount and GST rate.' });
        }
    
        // Calculate CGST and SGST
        const cgstRate = gstRate / 2; // Assuming equal split between CGST and SGST
        const sgstRate = gstRate / 2;
        
        const cgstAmount = (amountExcludingGST * cgstRate) / 100;
        const sgstAmount = (amountExcludingGST * sgstRate) / 100;
        
        const totalAmountIncludingGST = amountExcludingGST + cgstAmount + sgstAmount;
    
        res.json({
            amountExcludingGST: amountExcludingGST,
            cgstRate: cgstRate,
            sgstRate: sgstRate,
            cgstAmount: cgstAmount,
            sgstAmount: sgstAmount,
            totalAmountIncludingGST: totalAmountIncludingGST
        });
    } catch (error) {
        return res.status(500).send({message:error.message,status:500})
    }
}