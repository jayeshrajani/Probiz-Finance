import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Potential with Pradhan Mantri Mudra Yojna Loans!
          </h3>
         
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/4942854_39369.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
              <p className="text-[#4d4d4d] ">
                The Pradhan Mantri Mudra Yojana (PMMY) is a flagship initiative
                by the Government of India aimed at empowering small and
                micro-businesses. This scheme provides collateral-free loans to
                entrepreneurs, startups, and small business owners to help them
                grow and expand their enterprises.
              </p>
              <h5 className="text-[#4d4d4d] font-[700] mt-3">
                Key Features of PMMY Loan
              </h5>
              <p className="text-[#676767]"> Loan amount up to ₹10 lakh</p>
              <p className="text-[#676767]">No collateral required</p>
              <p className="text-[#676767]">
                Available for small businesses, startups, and MSMEs
              </p>
              <p className="text-[#676767]"> Competitive interest rates</p>
              <p className="text-[#676767]">Flexible repayment tenure</p>
              <h5 className="text-[#4d4d4d] font-[700] mt-3">
                Types of MUDRA Loans
              </h5>
              <p className="mt-2">
                <span className="font-[600]">
                  Shishu Loan (Up to ₹50,000) :
                </span>
                For early-stage businesses
              </p>
              <p className="mt-2">
                <span className="font-[600]">
                  Kishor Loan (₹50,000 – ₹5 Lakh) :
                </span>
                For growing businesses
              </p>
              <p className="mt-2">
                <span className="font-[600]">
                  Tarun Loan (₹5 Lakh – ₹10 Lakh) :
                </span>
                For established enterprises
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
