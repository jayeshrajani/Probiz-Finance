import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Potential with Buisness Loan !
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            With low interest rates, flexible repayment plans, and quick
            approvals, Probiz ensures that your business reaches new heights
            effortlessly!
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/business.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6 mt-5">
              <p className="text-[#4d4d4d] text-lg font-[700]">
                Probiz offers customized business loan solutions for small,
                medium, and large enterprises to support growth, expansion, and
                efficiency:
              </p>
              <p className="text-[#676767] mt-3 ">
                <span className="text-black font-[600]">
                  Small Enterprises:{" "}
                </span>
                Support for working capital and inventory management.
              </p>
              <p className="text-[#676767] mt-2">
                <span className="text-black font-[600]">
                  Medium Enterprises:
                </span>
                Funding for business expansion and technological upgrades.
              </p>
              <p className="text-[#676767] mt-2">
                <span className="text-black font-[600]">
                  Large Enterprises:
                </span>
                Major project funding and substantial capital requirements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
