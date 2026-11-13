import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Unlock Instant Funds with a Gold Loan!
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            Need quick financial assistance? Your gold can help you secure an
            instant loan with low interest <br /> rates and minimal paperwork.
            Whether it's for personal needs, business expansion, or emergency
            expenses, our gold loan <br /> solutions offer a secure and
            hassle-free way to access cash.
          </p>
          <div className="grid md:grid-cols-12 mt-10 ">
            <div className="col-span-6 flex justify-center">
              <img
                className="pe-2 w-[75%]"
                src="/images/2149872246.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6 mt-5">
              <p className="text-[#4d4d4d] text-lg font-[700]">
                Why Choose Our Gold Loan?
              </p>

              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                <span className="text-black font-[600]">
                  {" "}
                  Instant Approval & Disbursal :
                </span>{" "}
                Get funds in minutes!
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="text-black font-[600]">
                  {" "}
                  High Loan Value :
                </span>{" "}
                Get up to 90% of your gold’s value.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="text-black font-[600]">
                  {" "}
                  Low Interest Rates :
                </span>{" "}
                Competitive rates to make repayment easy.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="text-black font-[600]">
                  {" "}
                  Flexible Repayment Options :
                </span>{" "}
                Choose a plan that suits your needs.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="text-black font-[600]">
                  {" "}
                  No Credit Score Required :
                </span>{" "}
                Your gold secures the loan, not your credit history.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                Turn your gold into financial freedom today! Apply now for a
                hassle-free gold loan experience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
