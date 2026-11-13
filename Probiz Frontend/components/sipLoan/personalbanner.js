import React from "react";
import Styles from "../../styles/home.module.css";

export default function PersonalBanner() {
  return (
    <>
      <section className={Styles.home_banner_sec}>
        <div className="grid md:grid-cols-12">
          <div
            className="md:col-span-4 md:pl-10 pl-5"
            style={{ paddingTop: "100px" }}
          >
            <h1 className="font-black md:text-5xl text-4xl font-Metropolis mt-10">
              Unlock your Financial<br />
              growth with{" "}
              <span className="text-[#219B9E]">Systematic Investment Plans!</span>
            </h1>

            <div className={Styles.banner_icon}>
              <img src="/images/call.png" alt="Call Icon" />
              <p className={Styles.icon_phone}>9589216912</p>
             <a href="https://www.facebook.com/probizmanagement"><img className="pr-2" src="/images/facebook.png" alt="Facebook Icon" /></a>
              <img className="pr-2" src="/images/youtube.png" alt="YouTube Icon" />
                <a href="https://linkedin.com/company/probizmanagement"><img className="pr-2" src="/images/linkedin.png" alt="LinkedIn Icon" /></a>
              <a href="https://www.instagram.com/financeprobiz/"><img className="pr-2" src="/images/instagram.png" alt="Instagram Icon" /></a>
            </div>
          </div>
          <div className="md:col-span-8">
            <div className="hidden md:block">
              <img
                className={Styles.home_banner_sec_img}
                src="/images/personalbannerimg.png"
                alt="Banner"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
