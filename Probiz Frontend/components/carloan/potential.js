import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Potential with Car Loan !
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            "Get the best car loan deals with flexible repayment options, <br />
            low-interest rates, and quick approvals to help you drive your dream
            car hassle-free."
          </p>
          <div className="grid md:grid-cols-12 mt-10">
            <div className="col-span-6">
              <img
                className="pe-2 rounded-2xl"
                src="/images/carLoan.jpg"
                alt="personal potential"
                width="100%"
              />
            </div>
            <div className="col-span-6">
              <p className="text-[#4d4d4d] text-lg font-[700]">
                Probiz specializes in car loan services for both new and used
                vehicles, featuring up to 200% funding of used car value:
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                - Quick approval, attractive interest rates, and flexible
                tenure.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7">
                - Up to 200% funding of used car value.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7">
                - Minimal documentation and fast processing.
              </p>
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                "With Probiz, securing a car loan is easier than ever. Our
                hassle-free loan process ensures you get the best financing
                options tailored to your needs. Whether you're purchasing a
                brand-new car or a pre-owned vehicle, we provide competitive
                interest rates, quick disbursement, and flexible repayment
                plans. Our expert team is here to guide you every step of the
                way, making car ownership a seamless experience."
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
