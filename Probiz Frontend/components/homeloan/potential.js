import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Potential with Home Loans!
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            Owning a home is a dream for many, and at Probiz, we make it easier
            by offering customized home loan solutions designed to fit your
            unique financial situation. Whether you're a first-time buyer or
            looking to invest in property, our flexible financing options ensure
            a smooth and hassle-free experience.
          </p>
          <div className="grid md:grid-cols-12 mt-10 px-6 lg:px-12 gap-8">
  {/* Image Section */}
  <div className="col-span-6 flex justify-center">
    <img
      className="pe-2 max-w-full rounded-2xl"
      src="/images/homeloan.jpg"
      alt="personal potential"
    />
  </div>

  {/* Content Section */}
  <div className="col-span-6 space-y-4">
    <p className="text-[#4d4d4d] text-lg font-bold leading-relaxed">
      At Probiz, we understand the unique financial needs and challenges of our
      clients. Hence, we offer specialized home loan solutions tailored
      specifically for individuals facing challenges such as:
    </p>

    <div className="space-y-2">
      <p className="text-[#676767]">
        <span className="text-black font-semibold">Low CIBIL Score: </span>
        Flexible home loan approvals for clients with low or challenged credit
        scores.
      </p>
      <p className="text-[#676767]">
        <span className="text-black font-semibold">Cash Income: </span>
        Special consideration for applicants whose primary income source is
        cash-based.
      </p>
      <p className="text-[#676767]">
        <span className="text-black font-semibold">Legal & Illegal Properties: </span>
        Expert assistance in financing properties that have legal complications
        or unclear documentation.
      </p>
    </div>

    <p className="text-[#4d4d4d] text-lg font-bold mt-6">
      With Probiz, you can benefit from:
    </p>

    <div className="space-y-2">
      <p className="text-[#676767]">
        <span className="text-black font-semibold">Lowest Rate of Interest: </span>
        Competitive interest rates starting from 7.10% per annum.
      </p>
      <p className="text-[#676767]">
        <span className="text-black font-semibold">Fast Processing: </span>
        Quick loan approval and disbursement.
      </p>
      <p className="text-[#676767]">
        <span className="text-black font-semibold">Minimal Documentation: </span>
        Simplified paperwork for efficient loan processing.
      </p>
      <p className="text-[#676767]">
        <span className="text-black font-semibold">Instant Approval: </span>
        Immediate evaluation and sanction for quick homeownership.
      </p>
      <p className="text-[#676767]">
        <span className="text-black font-semibold">100% Funding: </span>
        Complete financial support to realize your dream home.
      </p>
    </div>
  </div>
</div>

        </div>
      </section>
    </>
  );
}
