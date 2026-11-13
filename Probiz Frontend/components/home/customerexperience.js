import React from "react";

export default function CustomerExperience() {
  return (
    <div style={{margin:"30px"}}>
      <div className="md:container  mx-auto bg-[#219B9E] rounded-xl mt-8 py-4 sm:px-5">
        <div className="md:flex justify-around items-center px-5">
          <div>
            <img
              // className="px-4"
              src="/images/calculator.png"
              alt="Banner"
            />
          </div>
          <div>
            <h1 className="text-xl text-white font-[600]">
              Creating Extraordinary Customer Experience
            </h1>
            <p className="text-white text-lg mt-3">
              5 Lac+ people have got their Credit Scores for FREE!
            </p>
          </div>
          <div>
            <button
              className="bg-white rounded"
              style={{ padding: " 7px 20px", fontWeight:"600" }}
            >
              CHECK CREDIT CARD SCORE FOR FREE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
