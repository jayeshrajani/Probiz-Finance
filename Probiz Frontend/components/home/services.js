import Link from "next/link";
import React from "react";

export default function Services() {
  return (
    <>
      <section className="bg-[#FF7F00] py-10">
        <div className="container mx-auto">
          
          <h1 className="text-center text-white text-3xl font-[600]">
            {" "}
            Other Services
          </h1>
          <p className="text-center text-white mt-5">
          We offer a wide range of financial and business services to help you manage and grow your wealth with ease. <br/>Whether you need expert financial guidance, business development strategies, or corporate solutions, we’ve got you covered.
          </p>
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <div className="services_card">
              <img
                className="w-full"
                src="/images/servicesimg1.png"
                alt="services card"
              />
              <div
                style={{
                  boxShadow: " rgba(149, 157, 165, 0.2) 0px 8px 24px",
                  backgroundColor: "white",
                  padding: "30px 20px",
                }}
              >
                <h4 className="font-[600] text-xl">CA Service</h4>
                <p className="text-[#666666]">
                Get expert assistance with tax planning, auditing, and financial consulting to ensure smooth and compliant financial management.
                </p>
                 <div className="mt-4">
                              <Link href="/ca-services">
                              <button className="bg-[#4C1F7A] text-white py-2 px-4 rounded">
                           View More
                              </button>
                              </Link>
                            </div>
              </div>
            </div>
            <div className="services_card">
              <img
                className="w-full"
                src="/images/servicesimg2.png"
                alt="services card"
              />
              <div
                style={{
                  boxShadow: " rgba(149, 157, 165, 0.2) 0px 8px 24px",
                  backgroundColor: "white",
                  padding: "30px 20px",
                }}
              >
                <h4 className="font-[600] text-xl">Government Business Loan Services</h4>
                <p className="text-[#666666]">
                Unlock business growth with professional business development services, market analysis, and strategic planning.
                </p>
                <div className="mt-4">
                              <Link href="/government-business-services">
                              <button className="bg-[#4C1F7A] text-white py-2 px-4 rounded">
                           View More
                              </button>
                              </Link>
                            </div>
              </div>
            </div>
            <div className="services_card">
              <img
                className="w-full"
                src="/images/servicesimg3.png"
                alt="services card"
              />
              <div
                style={{
                  boxShadow: " rgba(149, 157, 165, 0.2) 0px 8px 24px",
                  backgroundColor: "white",
                  padding: "40px 20px",
                }}
              >
                <h4 className="font-[600] text-xl">E-Stamp Services</h4>
                <p className="text-[#666666] ">
                From company formation to financial structuring, we provide complete support for your business success.
                </p>
                 <div className="mt-4">
                              <Link href="/e-stamp-services">
                              <button className="bg-[#4C1F7A] text-white py-2 px-4 rounded">
                           View More
                              </button>
                              </Link>
                            </div>
              </div>
            </div>
          </div>
          <p className="text-center text-white mt-5">
          Ready to take your finances and business to the next level? Partner with us today!
          </p>
        </div>
      </section>
    </>
  );
}
