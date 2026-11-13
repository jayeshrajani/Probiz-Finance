import React from "react";

export default function Properties() {
  return (
    <>
      <div className="container mx-auto py-12">
        <div>
          <h4 className="text-[#219B9E] justify-end flex ">
            <span>View More </span>
            <span>
              <img
                // className="px-4"
                src="/images/right arrow blue.png"
                alt="right arrow"
              />
            </span>{" "}
          </h4>
        </div>
        <h2 className="text-2xl font-bold mb-4  text-center">Our Properties</h2>
        <p className="text-gray-600 mb-10  text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam, dapibus
          mattis vel feugiat erat tortor eleifend.
        </p>
        <div className="grid md:grid-cols-3">
          <div className="propertie_card">
            <div>
              <img
                // className="px-4"
                src="/images/propertiescard1.png"
                alt="properties card"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-[600]">Heading Goes Here</h3>
              <p className="text-[#666666] text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elitsagittis
                arcu. Aliquam erat volutpat. 
              </p>
            </div>
          </div>
          <div className="propertie_card">
            <div>
              <img
                // className="px-4"
                src="/images/propertiescard2.png"
                alt="properties card"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-[600]">Heading Goes Here</h3>
              <p className="text-[#666666] text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elitsagittis
                arcu. Aliquam erat volutpat. 
              </p>
            </div>
          </div>
          <div className="propertie_card">
            <div>
              <img
                // className="px-4"
                src="/images/propertiescard3.png"
                alt="properties card"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-[600]">Heading Goes Here</h3>
              <p className="text-[#666666] text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elitsagittis
                arcu. Aliquam erat volutpat. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
