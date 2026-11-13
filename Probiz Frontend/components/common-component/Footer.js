import React from "react";

export default function Footer() {
  return (
    <>
      <footer className="py-12">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-5 gap-x-10">
            <div>
              <h3 className="text-lg font-[600] text-[#010101] mb-3">
                About the company
              </h3>
              <p className="text-[#676767] font-[500] mt-4">
                Learn To Love Growth And Change And You Will Be A Success.{" "}
              </p>
              <div className="flex mt-4">
                <a href="https://www.facebook.com/probizmanagement">
                  <img
                    className="pe-4"
                    src="/images/facebook.png"
                    alt="facebook"
                  />
                </a>
                <a href=" https://www.youtube.com/user/MyCompanyChannel">
                  <img className="pe-4" src="/images/youtube.png" alt="youtube" />
                </a>
                <a href="https://linkedin.com/company/probizmanagement">
                  <img
                    className="pe-4"
                    src="/images/linkedin.png"
                    alt="linkdin"
                  />
                </a>
                <a href="https://www.instagram.com/financeprobiz/">
                  <img
                    className="pe-4"
                    src="/images/instagram.png"
                    alt="instagram"
                  />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-[600] text-[#010101] mb-3">
                Services
              </h3>
              <ul>
                <a href="/ca-services">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    CA Services
                  </li>
                </a>
                <a href="/real-estate-services">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Real Estate
                  </li>
                </a>
                <a href="/e-stamp-services">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    E-Stamp Service
                  </li>
                </a>
                <a href="/dsa-franchise">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Loan DSA Franchise
                  </li>
                </a>

              </ul>
            </div>
            <div>

              <h3 className="text-lg font-[600] text-[#010101] mb-3">
                Loans
              </h3>
              <ul>

                <a href="/homeloan">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Home Loan
                  </li>
                </a>
                <a href="/personalloan">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Personal Loan
                  </li>
                </a>
                <a href="/mortrageloan">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Mortgage Loan
                  </li>
                </a>
                <a href="/carloan">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Car Loan
                  </li>
                </a>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-[600] text-[#010101] mb-3">Company</h3>
              <ul>
                <a href="/about">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    About Us
                  </li>
                </a>
                <a href="/contact">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Contact Us
                  </li>
                </a>
                <a href="/terms-conditions">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Terms & Conditions
                  </li>
                </a>
                <a href="/privacy-policy">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Privacy Policy
                  </li>


                </a>
                <a href="/Careers">
                  <li className="list-none text-[#676767] font-[600] mb-2">
                    Careers
                  </li>
                </a>

              </ul>
            </div>
            <div>
              <h3 className="text-lg font-[600] text-[#010101] mb-3">
                Contact
              </h3>
              <div className="flex ">
                <img className="me-3" src="/images/call.png" alt="Banner" />
                <p className="text-[#010101] font-[600]">8770052912

                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-center text-[#676767] font-[500] mt-4">Design By <span className="text-black">Aahan Technologies</span></p>
          </div>
        </div>
      </footer>
    </>
  );
}
