import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Potential with  Education Loans!
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            A quality education opens doors to endless opportunities, and our
            education loans help you achieve <br /> your academic aspirations
            without financial stress. Whether you're planning to study in India
            or abroad, we offer <br /> affordable interest rates, quick
            approvals, and flexible repayment options to support your journey.
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/15357.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6 mt-5">
              <p className="text-[#4d4d4d] text-lg font-[700]">
                Why Choose Our Education Loans?
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                <span className="font-[600] text-black">
                  Seamless Application Process :{" "}
                </span>
                Apply online with minimal paperwork.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="font-[600] text-black">
                  No Collateral for Select Loans :{" "}
                </span>
                Get funding without security for eligible courses.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="font-[600] text-black">
                  Affordable Interest Rates :{" "}
                </span>
                Designed to ease your repayment burden.
              </p> 
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="font-[600] text-black">
                  Flexible Repayment Tenure :{" "}
                </span>
                Pay at your convenience, even after graduation.
              </p> 
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="font-[600] text-black">
                  Covers Domestic & International Studies :{" "}
                </span>
                Pursue education anywhere in the world.
              </p>  
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                Achieve your academic dreams with financial support tailored to
                your needs. Invest in knowledge, invest in your future!
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
