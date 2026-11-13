import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
          Unlock Your Dream Home with Flat Purchase Loans! 🏡
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
          Achieve homeownership effortlessly with our tailored flat purchase loan solutions. Whether you're a first-time buyer or an investor, <br/>we ensure a smooth and transparent process to help you secure your dream property.
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/flate.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
              <p className="text-[#4d4d4d] text-lg font-[700]">
              Why Choose Us?
              </p><br/>
              <p className="text-[#676767] font-[500] text-base leading-7">
              ✅ Quick Approval – Fast-track your loan processing with minimal documentation.<br/><br/>
✅ 100% Paperless – Enjoy a digital-first experience with no paperwork hassle.<br/><br/>
✅ Competitive Interest Rates – Affordable financing options tailored to your needs.<br/>
          </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
              With flexible repayment plans, expert guidance, and a customer-first approach, we make home buying a stress-free journey.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
              📩 Get Started Today! Let’s turn your dream home into reality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
