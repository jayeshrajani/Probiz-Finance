import React from "react";
import Styles from "../../styles/home.module.css";
export default function Banner() {
  return (
    <>
      <section className={Styles.home_banner_sec}>
        <div className="grid md:grid-cols-12">
          <div className="md:col-span-4 md:ps-10 ps-5" style={{ paddingTop: "100px" }}>
            <h1 className="font-black md:text-5xl text-4xl  mt-10">Smart funding with complete confidence Probiz - Your Premier Capital Partner</h1>
            <p className="text-[#676767] mt-3 ">
              The harder you work for something, the greater you’ll feel when
              you achieve. Get Home Loans.
            </p>
            <a href="/contact"><button className={Styles.apply_now_btn}>Apply Now</button></a>
            <div className={Styles.banner_icon}>
              <img src="/images/call.png" alt="Banner" />
              <p className={Styles.icon_phone}>8770052912</p>
              <img className="pe-2" src="/images/facebook.png" alt="Banner" />
              <img className="pe-2" src="/images/youtube.png" alt="Banner" />
              <img className="pe-2" src="/images/linkedin.png" alt="Banner" />
              <img className="pe-2" src="/images/instagram.png" alt="Banner" />
            </div>
          </div>
          <div className="md:col-span-8">
            <div className="hidden md:block">
              <img
                className={Styles.home_banner_sec_img}
                src="/images/bannerimg.png"
                alt="Banner"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
