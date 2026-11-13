import React from "react";
import Styles from "../../styles/home.module.css";
import Link from "next/link";

export default function TrendingCards() {
  return (
    <>
      <section className="py-12">
        <div className="container mx-auto">
          <h3 className="text-center text-3xl font-[700] text-[#343434] mt-5">
            Trending Loans & Offers
          </h3>
          <p className="text-center text-[#716D6D] mt-5">
            Explore the latest loan options and exclusive offers designed to meet your financial goals. Benefit from competitive interest rates, hassle-free approvals, and flexible repayment options.
          </p>
          {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {/* Card 1 */}
          <div className="text-center space-y-4">
            <img src="/images/bag.png" alt="Personal Loan" className="mx-auto h-16 w-16" />
            <h3 className="text-black font-bold text-xl">Personal Loan</h3>
            <p className="text-[#716D6D] text-sm">
              Fast & Paperless – Get instant approval with minimal documentation at low-interest rates.
            </p>
            <button className={Styles.apply_now_btn}>
              CHECK ELIGIBILITY
            </button>
          </div>

          {/* Card 2 */}
          <div className="text-center space-y-4">
            <img src="/images/home.png" alt="Home Loan" className="mx-auto h-16 w-16 p-2" />
            <h3 className="text-black font-bold text-xl">Home Loan</h3>
            <p className="text-[#716D6D] text-sm">
              Dream Home Made Easy – Avail home loans at the lowest interest rates with quick approvals.
            </p>
            <Link href="/homeloan">
              <button className={Styles.apply_now_btn}>
                CHECK ELIGIBILITY
              </button>
            </Link>
          </div>

          {/* Card 3 */}
          <div className="text-center space-y-4">
            <img src="/images/globe.png" alt="Loan Against Property" className="mx-auto h-16 w-16" />
            <h3 className="text-black font-bold text-xl">Loan Against Property</h3>
            <p className="text-[#716D6D] text-sm">
              Leverage Your Property – Get high-value loans with attractive interest rates and easy repayment terms.
            </p>
             <Link href="/mortrageloan">
            <button className={Styles.apply_now_btn}>
              CHECK ELIGIBILITY
            </button>
            </Link>
          </div>

          {/* Card 4 */}
          <div className="text-center space-y-4">
            <img src="/images/globe.png" alt="Business Loan" className="mx-auto h-16 w-16" />
            <h3 className="text-black font-bold text-xl">Business Loan</h3>
            <p className="text-[#716D6D] text-sm">
              Fuel Your Business Growth – Competitive interest rates and customized repayment options for entrepreneurs.
            </p>
              <Link href="/buisnessloan">
            <button className={Styles.apply_now_btn}>
              CHECK ELIGIBILITY
            </button>
            </Link>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
