import React, { useState } from 'react';
import { FaCalculator, FaWhatsapp, FaClock, FaStar, FaFileAlt, FaVideo } from 'react-icons/fa';
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';
import { PostRequest } from '../components/api-handler';
import swal from "sweetalert";
import { useRouter } from "next/router";
const strategies = [
  { icon: <FaCalculator className="text-blue-600 text-3xl" />, title: "Instant Estimate Calculator", desc: "Check stamp duty and registration charges by entering property details." },
  { icon: <FaWhatsapp className="text-green-600 text-3xl" />, title: "WhatsApp Chat Button", desc: "Quickly connect with us via WhatsApp for instant support." },
  { icon: <FaClock className="text-red-500 text-3xl" />, title: "TAT-Based Promise", desc: "Guaranteed registration completion in 48 hours!" },
  { icon: <FaStar className="text-yellow-500 text-3xl" />, title: "Google Reviews Integration", desc: "Showcasing real customer reviews for transparency." },
  { icon: <FaFileAlt className="text-indigo-600 text-3xl" />, title: "Ready Templates & Samples", desc: "Download affidavits, rent agreements & more in exchange for contact info." },
  { icon: <FaVideo className="text-purple-600 text-3xl" />, title: "Explainer Video", desc: "A 1-minute animation explaining registry, notary, and e-stamp processes." },
];

const EStampService = () => {
  const router = useRouter();
  const [name, setName] = useState("");
        const [email, setEmail] = useState("");
        const [number, setNumber] = useState("");
        const [message, setMessage] = useState("");
        const [loading, setLoading] = useState(false);
      
        const AddService = async (e) => {
          setLoading(true);
          e.preventDefault();
          const data = {
            name: name,
            email: email,
            mobile_no: number,
            message: message,
          };
          const res = await PostRequest("addEStampService", data);
      
          if (res.status === true) {
            swal({
               icon: "success",
               text: "Service Submitted Successfully!",
             }).then(() => {
               // Refresh the page after OK click
               router.reload();
             });
            setLoading(false)
      
          }
      
        };
  return (
    <>
    <HeaderSec/>
    <div className="container mx-auto py-12 px-6">
    <div className="w-full flex justify-center mb-8">
      <img src="/images/print.jpg" width={1200} height={400} alt="Audit & Accounting Services" className="rounded-lg shadow-lg" />
    </div>
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Customer Attraction Strategy</h1>
        <p className="text-gray-600 mt-2">For Registry, Notary & E-Stamp Services</p>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
            {item.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Limited-Time Offers */}
      <div className="mt-10 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800">🔥 Limited-Time Offers</h2>
        <ul className="text-gray-700 mt-2 list-disc list-inside">
          <li>₹200 OFF on First Notary Service</li>
          <li>Combo Pack: Registry + E-Stamp + Notary @ ₹999*</li>
        </ul>
      </div>

      
    </div>
<div className="bg-[#FF7F00] min-h-screen flex items-center justify-center px-4 py-10">
  <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
    
    {/* Left Side Image */}
    <div className="md:w-1/2 w-full h-64 md:h-auto">
      <img
        src="/images/credit-score.jpg"
        alt="Real Estate Services"
        className="object-cover w-full h-full"
      />
    </div>

    {/* Right Side Form */}
    <div className="md:w-1/2 w-full p-8 md:p-10">
      <h1 className="text-3xl font-bold text-[#4C1F7A] text-center mb-8">
      Credit Score Service
      </h1>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Mobile Number"
          value={number}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          onChange={(e) => setNumber(e.target.value)}
        />
       <textarea
          placeholder="Type your message here"
          value={message}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <button
          type="submit"
          className="w-full py-3 bg-[#4C1F7A] text-white rounded-lg font-semibold hover:bg-[#3a165f] transition duration-200"
          onClick={AddService}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>

  </div>
</div>
    <Footer/>
    </>
  );
};

export default EStampService;
