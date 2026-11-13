import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Potential with Kisan Credit Card !
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            The Kisan Credit Card (KCC) is designed to provide farmers with
            affordable <br /> and hassle-free credit to meet their agricultural
            and allied expenses.
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2"
                src="/images/17239.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6 mt-5">
              <p className="text-[#4d4d4d] text-lg font-[700]">
                Key Benefits of Kisan Credit Card:
              </p>

              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                <span className="text-black font-[600]">
                  {" "}
                  Low-Interest Rates :
                </span>{" "}
                {""}
                Avail financing at subsidized rates for farming needs.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="text-black font-[600]">
                  {" "}
                  Flexible Repayment Options :
                </span>{" "}
                {""}
                Easy repayment aligned with crop cycles.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="text-black font-[600]">
                  {" "}
                  Quick & Hassle-Free Process :
                </span>{" "}
                {""}
                Minimal paperwork and fast loan approvals.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="text-black font-[600]">
                  {" "}
                  Comprehensive Coverage :
                </span>{" "}
                {""}
                Covers expenses for seeds, fertilizers, machinery, and more.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-1">
                <span className="text-black font-[600]">
                  {" "}
                  Insurance Coverage :
                </span>{" "}
                {""}
                Protection against crop losses due to natural calamities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
