import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Unlock New Potential with Balance Transfer Loans!
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            Take control of your finances with smarter loan options designed to help you save more and pay less. Transfer your existing commercial loan today and enjoy unbeatable benefits.
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/bt.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
             
              <div className="mt-4">
                <label className="inline-flex items-center text-lg mt-2">
                  <input
                    type="checkbox"
                    name="option1"
                    //   checked={checkedItems.option1}
                    //   onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">Quick Approval</span>
                 
                </label>{" "}
                 <p className="text-[#676767] font-[500] text-base leading-7">
                No delays—get your loan transfer approved faster than ever.
              </p>
                <br />
                <label className="inline-flex items-center text-lg mt-2">
                  <input
                    type="checkbox"
                    name="option1"
                    //   checked={checkedItems.option1}
                    //   onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">100% Paperless</span>
                </label>{" "}
                <p className="text-[#676767] font-[500] text-base leading-7">
                Experience a seamless digital process from application to approval.
              </p>
                <br />
                <label className="inline-flex items-center text-lg mt-2">
                  <input
                    type="checkbox"
                    name="option1"
                    //   checked={checkedItems.option1}
                    //   onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">
                    Competitive Interest Rates
                  </span>
                </label>{" "}
                <p className="text-[#676767] font-[500] text-base leading-7">
               Enjoy lower EMIs with attractive interest rates tailored for you.
              </p>
                <br />
              </div>
             
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
