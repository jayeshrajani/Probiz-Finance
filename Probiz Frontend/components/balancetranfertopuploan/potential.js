import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
           Unlock More with Balance Transfer Top-Up Loans!
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            Looking to access extra funds while transferring your existing loan? A Balance Transfer Top-Up Loan gives you both—lower interest rates and additional finance—all in one simple step.

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
                 
                <br />
              </div>
             <p className="text-[#676767] font-[500] text-base leading-7 mt-4">
              Whether you're planning a renovation, managing unexpected expenses, or investing in opportunities, a top-up loan helps you stay ahead financially without additional hassle.
              </p>
                <p className="text-[#676767] font-[500] text-base leading-7 mt-4">
              Explore smarter lending—apply today and make your money work harder for you!
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
