import React from "react";

export default function Potential() {
  return (
    <>
      <section className="py-16">
        <div className="container">
          <h3 className="text-center text-4xl font-[700] text-[#343434]">
            Potential with Systematic Investment Plans!
          </h3>
          <p className="text-center text-[#716D6D] mt-3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
            bibendum eget morbi <br /> dignissim eu pharetra consequat montes,
            sagittis.
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
                pulvinar turpis sit amet sem gravida maximus.
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
              <p className="text-[#676767] font-[500] text-base leading-7 mt-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
                pulvinar turpis sit amet sem gravida maximus. Sed at venenatis
                velit. Curabitur viverra facilisis eros lobortis semper. Lorem
                ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                facilisis nisl ut neque blandit sodales. Quisque ut purus
                faucibus, scelerisque magna eget, sagittis arcu. Aliquam erat
                volutpat.{" "}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
