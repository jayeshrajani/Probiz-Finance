import React from "react";

export default function MostPopular() {
  return (
    <section className="bg-[#FF7F00] py-12">
      <div className="container mx-auto ">
        <h2 className="text-2xl font-bold mb-4  text-center text-white">
          Most Popular
        </h2>
        <p className=" mb-10  text-center text-white font-[600]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam, dapibus
          mattis vel feugiat erat tortor eleifend.
        </p>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="blog_card bg-white shadow-lg">
            <div>
              <img
                className="w-full"
                src="/images/blogcard1.png"
                alt="blog card"
              />
            </div>
            <div className="py-5 px-10">
              <h3 className="text-[#FB724C] font-[700]">22 April 2021</h3>
              <p className="text-black font-[600] text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
          <div className="blog_card bg-white shadow-lg">
            <div>
              <img
                className="w-full"
                src="/images/blogcard2.png"
                alt="blog card"
              />
            </div>
            <div className="py-5 px-10">
              <h3 className="text-[#FB724C] font-[700]">22 April 2021</h3>
              <p className="text-black font-[600] text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
          <div className="blog_card bg-white shadow-lg">
            <div>
              <img
                className="w-full"
                src="/images/blogcard3.png"
                alt="blog card"
              />
            </div>
            <div className="py-5 px-10">
              <h3 className="text-[#FB724C] font-[700]">22 April 2021</h3>
              <p className="text-black font-[600] text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
