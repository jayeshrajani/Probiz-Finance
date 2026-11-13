import React from "react";

export default function LoanOffers() {
  return (
    <>
      <section className="bg-[#FF7F00] py-10 md:px-12  mt-10">
        <h1 className="text-white text-4xl text-center">
          Unlock Best Eligibility Loan Offers
        </h1>
        <p className="text-white text-base text-center mt-3">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam, dapibus
          mattis vel feugiat erat tortor eleifend.
        </p>
        <div className="grid md:grid-cols-12">
          <div className="cols col-span-6 mt-10 px-5">
            <div className="mt-5">
              <input
                placeholder="Required Loan Amount"
                className="py-2 rounded px-5 md:w-8/12 w-full"
              />
            </div>
            <div className="mt-5">
              <input
                placeholder="Monthly Net Salary"
                className="py-2 rounded px-5 md:w-8/12 w-full"
              />
            </div>
            <div className="mt-5">
              <input
                placeholder="Search Company Name"
                className="py-2 rounded px-5 md:w-8/12 w-full"
              />
            </div>
            <div className="mt-5">
              <select className="py-2 rounded px-5 md:w-8/12 w-full">
                <option>Choose City</option>
                <option>Choose City</option>
                <option>Choose City</option>
                <option>Choose City</option>
              </select>
            </div>
            <div className="mt-5">
              <label className="inline-flex items-center text-lg">
                <input
                  type="checkbox"
                  name="option1"
                  //   checked={checkedItems.option1}
                  //   onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-white text-[500] ">
                  I hereby appoint Probiz as my authorised representative to
                  receive my credit information from CIBIL. I hereby accept
                  terms & conditions.
                </span>
              </label>
            </div>
            <div className="mt-5">
              <button className="bg-[#4C1F7A] py-2 px-4 text-white md:w-8/12 w-full">
                GET QUOTES
              </button>
            </div>
          </div>
          <div className="cols col-span-6">
            <img src="/images/offersimg.png" alt="loan offer" />
          </div>
        </div>
      </section>
    </>
  );
}
