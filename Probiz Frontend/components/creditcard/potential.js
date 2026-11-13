import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Potential with Credit Card!
          </h3>
         
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/105194.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
              <p className="text-[#4d4d4d] text-lg font-[700]">
                At Probiz, we offer the best-in-class credit card services
                designed to enhance your lifestyle and financial convenience.
                Our carefully curated credit card options feature:
              </p>

              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                - Maximum rewards and benefits tailored to your spending
                patterns.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7">
                - High Credit Limits to meet your extensive financial needs.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7">
                - Zero or minimal annual fees, ensuring cost-effective card
                usage.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7">
                - Personalized guidance to choose the perfect credit card based
                on your lifestyle and financial habits.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7">
                - Quick Approval & Delivery directly to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
