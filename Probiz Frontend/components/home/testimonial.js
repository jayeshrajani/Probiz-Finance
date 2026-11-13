import React from "react";
import Slider from "react-slick"; // Import Slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Testimonial() {
  const testimonials = [
    {
      heading:"Featured Testimonial",
      quote:
        "This service completely transformed my financial planning!I was struggling to understand my home loan options until I used these calculators. The EMI breakdown helped me save ₹18,000/month by choosing the right tenure. The step-by-step guidance made complex decisions simple.",
      name: "Alicia B. Reiley",
      role: "Homeowner, Mumbai | May 2024",
    },
    {
      heading:"Loan Success Stories",
      quote:
        "Approved for 20L more than expected!The eligibility calculator showed me how to improve my loan amount by consolidating debts. My application was approved in just 48 hours!",
      name: "Rajesh K. Patel",
      role: "Small Business Owner | April 2024",
    },
    {
      heading:"Investment Wins",
      quote:
        "My SIP grew 27% faster than projected!Following the calculator's conservative estimates, I adjusted my portfolio and saw unbelievable returns. This tool pays for itself!",
      name: "Priya M. Nair",
      role: "Financial Analyst | March 2024",
    },
    // Add more testimonials as needed
  ];

  const settings = {
    dots: true, // Show pagination dots
    infinite: true, // Enable infinite scroll
    speed: 500, // Slide speed in ms
    slidesToShow: 1, // Number of slides to show at once
    slidesToScroll: 1, // Number of slides to scroll at once
    nextArrow: <div className="slick-arrow slick-next"></div>, // Custom next arrow
    prevArrow: <div className="slick-arrow slick-prev"></div>, // Custom prev arrow
  };

  return (
    <section className="py-12">
      <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Real Stories, Real Results</h2>
      <h2 className="text-xl font-semibold mb-4 text-center">Don't just take our word for it - hear from our satisfied clients</h2>
        <p className="mb-10 text-center font-[500]">
        Our clients' success is our greatest achievement. Here's what people are saying about their experience with us:
        </p>
        <div className="grid grid-cols-12">
          
          <div className="cols col-span-7">
            <Slider {...settings}>
              {testimonials.map((testimonial, index) => (
                <div key={index}>
                  <div className="max-w-2xl mx-auto">
                    <div>
                      <img src="/images/commo.png" alt="commo" />
                    </div>
      <h2 className="text-xl font-bold mb-4 text-center">{testimonial.heading}</h2>

                    <p className="text-lg text-black text-center" style={{fontWeight:"500"}}>
                      {testimonial.quote}
                    </p>

                    <div className="flex justify-end">
                      <img src="/images/commaright.png" alt="testimonial" />
                    </div>
                    <h3 className="text-xl font-semibold text-center">
                      {testimonial.name}
                    </h3>

                    <p className="text-gray-600 text-center">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </Slider>
<br/>
<br/>
      <h2 className="text-xl font-bold mb-4 ">Why Clients Love Us:</h2>
      <p className="text-gray-600">
      ✔ Accuracy Guarantee - Bank-grade calculations<br/>
✔ Time Savings - 83% faster than manual planning<br/>
✔ No Pressure - 100% advisor-free experience<br/><br/>
⭐ 4.9/5 Rating from 2,400+ verified users
                    </p>
          </div>
          <div className="cols col-span-5">
            <img src="/images/testimonialimg.png" alt="testimonial" />
          </div>
        </div>
      </div>
    </section>
  );
}
