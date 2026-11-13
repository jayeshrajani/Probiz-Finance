import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="px-6">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
          Unlock Financial Opportunities with Mortgage Loans! 🏠💰
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
          Leverage the value of your property to meet your financial needs with a Loan Against Property (LAP).<br/> Whether you need funds for business expansion, debt consolidation, or personal expenses, we offer the perfect solution.
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/mortgage-loan.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6 ">
              <p className="text-[#4d4d4d] text-lg font-[700]">
              Why Choose a Loan Against Property?
              </p><br/>
           
              <p className="text-[#676767] font-[500] text-base leading-7">
              ✔ High Loan Amounts – Get up to 70% of your property's market value<br/>
✔ Competitive Interest Rates – Lower than standard personal loans<br/>
✔ Flexible Tenure – Repayment options up to 20 years<br/>
✔ Quick Approvals – Hassle-free processing with minimal paperwork
          </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
              With a Loan Against Property, you can achieve your financial goals while keeping your assets secure. Apply today for a stress-free borrowing experience!
              </p>
              
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
