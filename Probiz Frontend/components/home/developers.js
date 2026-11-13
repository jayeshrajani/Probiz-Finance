import React from "react";

export default function Developers() {
  return (
    <>
      <section className="bg-[#FF7F00] mt-5 py-12">
        <div className="md:container mx-auto">
          <div>
            <h4 className="text-white justify-end flex ">
              <span>View More </span>
              <span>
                <img
                  // className="px-4"
                  src="/images/right arrow.png"
                  alt="Banner"
                />
              </span>{" "}
            </h4>
          </div>
          <h1 className="text-center text-3xl font-[700] text-white">
            Meet Our Expert Developers
          </h1>
          <p className="text-lg text-white text-center mt-3">
            Our team of skilled developers is dedicated to crafting innovative
            solutions for seamless <br /> digital experiences. Explore our
            developers and their expertise.
          </p>
          <div className="grid md:grid-cols-3  mt-5">
            <div className="developers_card">
              <img
                // className="px-4"
                src="/images/developercard1.png"
                alt="Banner"
              />
              <h3 className="text-lg text-white font-[600] mt-3">
                Heading Goes Here
              </h3>
              <p className="text-white mt-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elitsagittis
                arcu. Aliquam erat volutpat. 
              </p>
            </div>
            <div className="developers_card">
              <img
                // className="px-4"
                src="/images/developercard2.png"
                alt="Banner"
              />
              <h3 className="text-lg text-white font-[600] mt-3">
                Heading Goes Here
              </h3>
              <p className="text-white mt-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elitsagittis
                arcu. Aliquam erat volutpat. 
              </p>
            </div>
            <div className="developers_card">
              <img
                // className="px-4"
                src="/images/developercard3.png"
                alt="Banner"
              />
              <h3 className="text-lg text-white font-[600] mt-3">
                Heading Goes Here
              </h3>
              <p className="text-white mt-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elitsagittis
                arcu. Aliquam erat volutpat. 
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
