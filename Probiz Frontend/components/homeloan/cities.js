import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Cities() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Show 3 slides at once
    slidesToScroll: 3, // Scroll 3 slides at once
    nextArrow: <div className="slick-arrow slick-next"></div>,
    prevArrow: <div className="slick-arrow slick-prev"></div>,
  };

  return (
    <div className="container mx-auto my-8">
      <h2 className="text-center text-2xl font-semibold mb-4">
        Apply for a Home Loan in Top Cities
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Explore our home loan services in top cities and take a step closer to
        owning your dream home today!
      </p>

      <Slider {...settings}>
        <div className="p-4">
          <div className="overflow-hidden ">
            <div className="flex justify-center">
            <img src="/images/city1.png" alt="Delhi" className="" />
            </div>
            <h3 className="text-center text-lg font-[600] mt-2">Delhi</h3>
          </div>
        </div>
        <div className="p-4 flex justify-center">
          <div className=" overflow-hidden">
          <div className="flex justify-center">
            <img src="/images/city2.png" alt="Mumbai" />
            </div>
            <h3 className="text-center text-lg font-[600] mt-2">Mumbai</h3>
          </div>
        </div>
        <div className="p-4">
          <div className=" overflow-hidden">
          <div className="flex justify-center">
            <img src="/images/city3.png" alt="Chennai" />
            </div>
            <h3 className="text-center text-lg font-[600] mt-2">Chennai</h3>
          </div>
        </div>
        {/* Add more city cards as needed */}
      </Slider>
    </div>
  );
}
