import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
          Build Your Future with Plot Purchase & Construction Loans! 🏗️🏡
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
          Turn your dream home into reality with our seamless Plot Purchase & Construction Loan solutions. Whether you’re planning to buy a plot and build from scratch or construct on an existing one,<br/> we’ve got you covered with flexible financing options.
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/contruction-purchase.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
            <p className="text-[#4d4d4d] text-lg font-[700]">
              Why Choose Us?
              </p><br/>
              
              <p className="text-[#676767] font-[500] text-base leading-7">
              ✅ Quick Approval – Fast and hassle-free loan processing.<br/><br/>
✅ 100% Paperless – A seamless digital experience with minimal paperwork.<br/><br/>
✅ Competitive Interest Rates – Affordable financing tailored to your needs.
          </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
              We offer expert guidance, customized repayment plans, and end-to-end support to help you build the home you’ve always envisioned.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
              📩 Apply Now and take the first step toward your dream home!
              </p>
            
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
