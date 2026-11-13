import React from "react";

export default function Blogs() {
  return (
    <>
      <section className="bg-[#FF7F00] py-12">
        <div className="container mx-auto ">
          <h2 className="text-2xl font-bold mb-4  text-center text-white">
            Featured Blogs
          </h2>
         
          <div className="grid md:grid-cols-3 gap-10">
            <a href="/blogs/business-loans-blog">
            <div className="blog_card bg-white shadow-lg">
              <div>
                <img
                  className="w-full"
                  src="/images/blog1.jpg"
                  alt="blog card"
                />
              </div>
              <div className="py-5 px-10">
                <h3 className="text-[#FB724C] font-[700]">30 May 2025</h3>
                <p className="text-black font-[600] text-lg"> Unlock Your Business Potential with Probiz Management Services.</p>
              </div>
            </div>
            </a>
            <a href="/blogs/home-loans-blog">
            <div className="blog_card bg-white shadow-lg">
              <div>
                <img
                  className="w-full"
                  src="/images/blog2.jpg"
                  alt="blog card"
                />
              </div>
              <div className="py-5 px-10">
                <h3 className="text-[#FB724C] font-[700]">28 May 2025</h3>
                <p className="text-black font-[600] text-lg">Make Your Dream Home a Reality with Probiz Management Services.</p>
              </div>
            </div>
            </a>
            <a href="/blogs/personal-loan-blog">
            <div className="blog_card bg-white shadow-lg">
              <div>
                <img
                  className="w-full"
                  src="/images/blog3.jpg"
                  alt="blog card"
                />
              </div>
              <div className="py-5 px-10">
                <h3 className="text-[#FB724C] font-[700]">24 May 2025</h3>
                <p className="text-black font-[600] text-lg">Fulfill Your Dreams with a Personal Loan from Probiz Management Services.</p>
              </div>
            </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
