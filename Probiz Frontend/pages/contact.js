import React, { useState } from "react";
import Footer from "../components/common-component/Footer";
import { PostRequest } from "../components/api-handler";
import Styles from '../styles/home.module.css';
import HeaderSec from '../components/common-component/HeaderSec';
import swal from "sweetalert";
import { useRouter } from "next/router";

export default function Contact() {
    const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  const AddContact = async (e) => {
    e.preventDefault();
    const data = {
      name: name,
      email: email,
      mobile_no: number,
      message: message,
    };
    const res = await PostRequest("addContactUs", data);
    console.log("add contact api response is --->", res);
    if(res.message === "Contact added successfully"){
             
               swal({
               icon: "success",
               text: "Contact added successfully",
             }).then(() => {
               // Refresh the page after OK click
               router.reload();
             });
    }
  };
  return (
    <>
        <HeaderSec /> 
 

   
    
      <div className="mt-10 pl-0 md:pl-6 ">
  <div className="grid grid-cols-1 lg:grid-cols-12">
    {/* Left Section */}
    <div className="lg:col-span-6  mb-10 lg:mb-0">
      <h1 className="text-4xl lg:text-5xl font-[900] mt-5">
        Feel Free <br /> To Contact Us Anytime...
      </h1>

      <div className="mt-8 flex justify-center">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d235416.87119281068!2d75.7927935020258!3d22.78805991307456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s267%2C%20A%2C%20Shri%20Laxmi%20Nagar%2C%20Indore!5e0!3m2!1sen!2sin!4v1750070503150!5m2!1sen!2sin"
          width="80%"
          height="250"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-md"
        ></iframe>
      </div>

      <div className="flex flex-wrap items-center mt-5 gap-3">
         <a href="https://www.facebook.com/probizmanagement"><img className="pe-2" src="/images/facebook.png" alt="facebook" /></a>
        <a href="https://www.youtube.com/@probizfinance"><img className="pe-2" src="/images/youtube.png" alt="youtube" /></a>
        <a href="https://linkedin.com/company/probizmanagement"><img className="pe-2" src="/images/linkedin.png" alt="linkedin" /></a>
        <a href="https://www.instagram.com/financeprobiz/"><img className="pe-2" src="/images/instagram.png" alt="instagram" /></a> 
      
       
      </div >
      <div className="flex flex-wrap items-center mt-5 gap-3">
       <img src="/images/call.png" alt="Banner" />
        <p className="font-[600]">8770052912</p>
        </div>

      <div className="flex flex-col lg:flex-row mt-8 gap-4">
        <div className="flex items-start">
          <img className="pe-2" src="/images/emailicon.png" alt="emailicon" />
          <p className="font-[600] break-all">Info@probizfinance.com</p>
        </div>
        <div className="flex items-start">
          <img className="pe-2" src="/images/telegram.png" alt="location" />
          <p className="font-[600]">709, Clifton corporate, Indore</p>
        </div>
      </div>
    </div>

    {/* Right Section */}
    <div className="lg:col-span-6">
      <div
        className="relative flex justify-center items-center min-h-screen bg-[#FF7F00] px-4 py-10"
      >
        <div className="bg-white p-6 lg:p-10 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-5">
            <a href="/home">
              <img src="/images/logo.png" alt="Logo" className="h-16" />
            </a>
          </div>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              onChange={(e) => setNumber(e.target.value)}
            />
            <textarea
              placeholder="Type your message here"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className="w-full py-3 bg-[#4C1F7A] text-white rounded-lg transition duration-200"
              onClick={AddContact}
            >
              CONTINUE
            </button>
          </form>
        </div>

        <div className="absolute bottom-0 right-0 hidden lg:block">
          <img src="/images/tree.png" alt="tree" />
        </div>
      </div>
    </div>
  </div>
</div>

       
        <Footer />
  
    </>
  );
}
