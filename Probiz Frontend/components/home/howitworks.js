import React from "react";

export default function HowItWorks() {
  return (
    <>
      <section className="bg-[#FFF1E4] py-12">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-4  text-center">
            How It Works?
          </h2>
          <p className="text-gray-600 mb-4 font-semibold text-center">
          Simple Steps to Achieve Your Financial Goals
          </p>
          <p className="text-gray-600 mb-10  text-center">
          Our streamlined process makes financial planning effortless. Whether you're applying for a loan, investing, or managing your retirement funds, <br/>we guide you at every step with clarity and transparency.
          </p>
          <div className="grid md:grid-cols-3">
            <div className="">
              <div className="flex">
                <div className="works">
                  <div className="text-xl font-bold mr-4">01</div>
                  <h3 className="font-semibold mb-3 text-lg">Get Personalized Recommendations</h3>
                  <h4 className="font-semibold mb-3 text-md">Get Personalized Recommendations</h4>
                  <p className="text-[#676767] font-[500] mb-3 text-base ">
                  Answer a few quick questions about your financial needs, and our smart system will recommend the best products for your unique situation.
                  </p>
                  <p className="text-[#676767] font-[500] mb-3 text-base ">
                  ✔ No credit score impact<br/>
✔ 100% confidential<br/>
✔ Real-time results                  </p>
                  
                </div>
                <div>
                  <img src="/images/line.png" alt="line" className="w-[20rem]"/>
                </div>
              </div>

              <div className="flex mt-10">
                <div className="works">
                  <div className="text-xl font-bold mr-4">02</div>
                  <h3 className="font-semibold mb-3 text-lg">Compare Options</h3>
                  <h4 className="font-semibold mb-3 text-md">Make informed decisions with confidence</h4>
                  <p className="text-[#676767] font-[500] mb-3 text-base ">
                  View side-by-side comparisons of interest rates, fees, and features across top financial products from trusted partners.
                  </p>
                  <p className="text-[#676767] font-[500] mb-3 text-base ">
                  ▸ Detailed product breakdowns<br/>
▸ Customizable filters<br/>
▸ Expert ratings & reviews
                  </p>
                
                </div>
                <div>
                  <img src="/images/line1.png" alt="line" className="mt-32 w-[20rem]"/>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <img
                src="/images/illutration.png"
                alt="Illustration"
                width={300}
                height={300}
              />
            </div>
            <div>
              <div className="flex">
                <div>
                  <img src="/images/line4.png" alt="line" className="w-[20rem]"/>
                </div>
                <div className="works ml-4">
                  <div className="text-xl font-bold mr-4">03</div>
                  <h3 className="font-semibold mb-3 text-lg">Submit Digital Application</h3>
                  <h4 className="font-semibold mb-3 text-md">Complete your application in 10 minutes</h4>
                  <p className="text-[#676767] font-[500] mb-3 text-base ">
                  Our paperless process saves you time with auto-filled forms, e-signature capabilities, and secure document uploads.
                  </p>
                  <p className="text-[#676767] font-[500] mb-3 text-base ">
                  • Progress tracker<br/>
• Instant form validation<br/>
• 24/7 save & resume
                  </p>
                 
                </div>
              </div>
              <div className="flex mt-10">
                <div>
                  <img src="/images/line3.png" alt="line" className="w-[20rem] mt-32" />
                </div>
                <div className="works ml-4">
                  <div className="text-xl font-bold mr-4">04</div>
                  <h3 className="font-semibold mb-3 text-lg">Receive Fast Approval</h3>
                  <h4 className="font-semibold mb-3 text-md">Get decisions faster than traditional methods</h4>
                  <p className="text-[#676767] font-[500] mb-3 text-base ">
                  Most applicants receive conditional approval within 2 business days, with real-time status updates throughout the process.
                  </p>
                  <p className="text-[#676767] font-[500] mb-3 text-base ">
                  ✓ Dedicated support agent<br/>
✓ Secure document portal<br/>
✓ Competitive rate locking
                  </p>
                
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
