import React from "react";
import HeaderSec from "../components/common-component/HeaderSec";
import Footer from "../components/common-component/Footer";

export default function ForgotPassword() {
  return (
    <>
 <HeaderSec/>
        <div className="mt-10 pl-0 md:pl-6">
          <div className="grid md:grid-cols-12">
            <div className="col-span-6  px-16 hidden md:block">
             
              <h1 className="text-5xl text-[#010101] font-[700] py-12">
                We take care of <br /> your money...
              </h1>
              <p className="text-[#676767] text-lg mt-5">
                At ProBiz Management Services, we specialize in safeguarding and managing your financial wellbeing with trust, transparency, and technology.
              </p>
              <div className="mt-5">
                <label className="inline-flex items-center text-lg">
                  <input
                    type="checkbox"
                    name="option1"
                    //   checked={checkedItems.option1}
                    //   onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">
                    Professional and secure financial management solutions
                  </span>
                </label>
                <label className="inline-flex items-center text-lg mt-3">
                  <input
                    type="checkbox"
                    name="option2"
                    //   checked={checkedItems.option1}
                    //   onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">
                    Tax, compliance, and business support under one roof
                  </span>
                </label>
                <label className="inline-flex items-center text-lg mt-3">
                  <input
                    type="checkbox"
                    name="option2"
                    //   checked={checkedItems.option1}
                    //   onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">
                    Simplified tools to track and optimize your resources
                  </span>
                </label>
              </div>
              <div className="flex mt-3">
                <img src="/images/call.png" alt="Banner" />
                <p className="font-[700] ps-3 pr-7">9589216912</p>
                <img className="pe-2" src="/images/facebook.png" alt="Banner" />
                <img className="pe-2" src="/images/youtube.png" alt="Banner" />
                <img className="pe-2" src="/images/linkedin.png" alt="Banner" />
                <img
                  className="pe-2"
                  src="/images/instagram.png"
                  alt="Banner"
                />
              </div>
            </div>
            <div
              className=" bg-[#FF7F00] relative col-span-6 flex  justify-center min-h-screen"
              style={{
                // backgroundImage: "url(/images/signupbgimg.png)",
                // backgroundSize: "cover",
                padding: "30px",
              }}
            >
              
              <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full mt-10">
                <a href="/home">
                  <div className="flex justify-center mb-5">
                    <img src="/images/logo.png" alt="Logo" className="h-16" />
                  </div>
                </a>
                <h2 className="text-xl font-semibold text-center mb-5">
                  Forgot and Reset Password
                </h2>
                <p className="text-center text-[#676767] font-[600]">
                  Enter your registered email address below. We'll send you a secure link to reset your password and regain access to your account.
                </p>
                <form className="space-y-4 mt-3">
                  {/* <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  /> */}
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4C1F7A] text-white rounded-lg hover:bg-purple-700 transition duration-200"
                  >
                    Continue
                  </button>
                </form>
              </div>
              <div className="absolute bottom-0 right-0">
                <img src="/images/tree.png" alt="tree" />
              </div>
            </div>
          </div>
        </div>
        <Footer/>
    
    </>
  );
}
