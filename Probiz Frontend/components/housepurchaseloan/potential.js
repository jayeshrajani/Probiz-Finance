import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Unlock Your Dream Home with House Purchase Loans!
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            Get easy financing for your dream home with low-interest rates,
            quick approvals, <br /> and a hassle-free application process.
            Secure your future with the right home loan today!
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
                Our house purchase loans provide flexible repayment options,
                minimal documentation, and tailored loan solutions to suit your
                needs :
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
                  <span className="ml-3 text-[#676767] ">
                    Quick & Hassle-Free Approval
                  </span>
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
                    100% Digital & Paperless Process
                  </span>
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
                    Lowest Interest Rates Available
                  </span>
                </label>{" "}
                <br />
              </div>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                Whether you're buying your first home or upgrading to a new
                property, our house purchase loan is designed to meet your
                financial needs. Enjoy flexible repayment tenures, zero hidden
                costs, and customized loan plans to make homeownership a
                reality. Start your journey today with fast approvals and
                **minimal paperwork**!
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
