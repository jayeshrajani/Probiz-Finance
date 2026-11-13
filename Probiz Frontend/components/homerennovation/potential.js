import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Unlock the Potential with Home Renovation Loans!
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            Transform your house into the home of your dreams. Whether it’s a kitchen upgrade, extra space, or modern interiors — we’re here to fund your vision with ease.

          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/personalpotentialimg.png"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
              <p className="text-[#4d4d4d] text-lg font-[700]">
               Why Choose Our Home Renovation Loan?

              </p>
              <div className="mt-4">
                <label className="inline-flex items-center text-lg mt-2">
                  <input
                    type="checkbox"
                    name="option1"
                    //   checked={checkedItems.option1}
                    //   onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">Quick Approval – Get instant decisions so you can start renovating faster</span>
                </label>{" "}
                <br />
                <br />
                <label className="inline-flex items-center text-lg mt-2">
                  <input
                    type="checkbox"
                    name="option1"
                    //   checked={checkedItems.option1}
                    //   onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">100% Paperless – Apply online with minimal documentation</span>
                </label>{" "}
                <br />
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
                    Competitive Interest Rates – Affordable EMIs to suit your budget
                  </span>
                </label>{" "}
                <br />
              </div>
             
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
