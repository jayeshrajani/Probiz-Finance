import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
          Build Your Dream Home with a Construction Loan! 🏗️🏡
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
          Turn your vision into reality with our Construction Loan, designed to provide the financial support you need to build or renovate your home. With flexible repayment options, easy disbursal,<br/> and competitive interest rates, we help you construct your dream property hassle-free.
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/contruction.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
              <p className="text-[#4d4d4d] text-lg font-[700]">
              Why Choose Our Construction Loan?
              </p><br/>
              <p className="text-[#676767] font-[500] text-base leading-7">
              ✔ Flexible Disbursement – Funds released as per your construction phases<br/><br/>
✔ Low-Interest Rates – Affordable financing tailored to your budget<br/><br/>
✔ Quick & Easy Processing – Minimal paperwork and fast approvals<br/><br/>
✔ Customized Repayment Plans – Options to match your financial situation
          </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
              Whether you’re constructing a new home, expanding your property, or renovating an existing space, our Construction Loan makes it easy. 
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
              Apply today and start building your future!
              </p>
            
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
