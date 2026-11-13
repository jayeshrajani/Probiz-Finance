import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
          Fulfill Your Dreams with a Personal Loan! 💰✨
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
          Need funds for a dream vacation, home renovation, wedding, medical emergency, or debt consolidation? Our Personal Loan offers a quick and hassle-free way to access funds with minimal documentation and flexible repayment options.
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/personal.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
              <p className="text-[#4d4d4d] text-lg font-[700]">
              Why Choose Our Personal Loan?
              </p><br/>
              <p className="text-[#676767] font-[500] text-base leading-7">
              ✔ Instant Approval – Get funds in your account quickly<br/><br/>
✔ No Collateral Required – 100% unsecured loan<br/><br/>
✔ Flexible Loan Amounts – Borrow as per your needs<br/><br/>
✔ Easy Repayment – Tenure options up to 5 years<br/><br/>
✔ Competitive Interest Rates – Affordable monthly EMIs<br/><br/>
          </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
              Make your financial goals a reality—apply today and enjoy financial freedom! 
              </p>
             
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
