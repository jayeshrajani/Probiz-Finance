import React from "react";
import Styles from "../../styles/home.module.css";
export default function BlogBanner() {
  return (
    <>
      <section className={Styles.home_banner_sec}>
        <div className="grid md:grid-cols-12">
          <div
            className="md:col-span-3 md:pl-10 pl-5"
            style={{ paddingTop: "100px" }}
          >
            <h1 className="font-black md:text-5xl text-4xl font-Metropolis mt-10">
              Probiz Blogs
            </h1>
            <p className="text-[#676767] mt-3 text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
              finibus vel ligula ac consequatsed tincidunt enim leo. 
            </p>
            <div className={Styles.banner_icon}>
              <img src="/images/call.png" alt="Call Icon" />
              <p className={Styles.icon_phone}>8770052912</p>
              <img
                className="pr-2"
                src="/images/facebook.png"
                alt="Facebook Icon"
              />
              <img
                className="pr-2"
                src="/images/youtube.png"
                alt="YouTube Icon"
              />
              <img
                className="pr-2"
                src="/images/linkedin.png"
                alt="LinkedIn Icon"
              />
              <img
                className="pr-2"
                src="/images/instagram.png"
                alt="Instagram Icon"
              />
            </div>
          </div>
          <div className="md:col-span-9">
            <div className="hidden md:block">
              <img
                className={Styles.home_banner_sec_img}
                src="/images/blogbannerimg.png"
                alt="Banner"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
