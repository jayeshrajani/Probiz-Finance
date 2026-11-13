import React, { useState } from 'react';
import { FaRegLightbulb, FaClipboardList, FaMoneyCheckAlt, FaPaintBrush, FaGlobe, FaBullhorn, FaUserCheck, FaRocket } from 'react-icons/fa';
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';
import { PostRequest } from '../components/api-handler';
import swal from "sweetalert";
import { useRouter } from "next/router";
const modules = [
  { icon: <FaRegLightbulb className="text-yellow-500 text-3xl" />, title: "Business Planning & Idea Validation", desc: "Market research, competitor analysis & brand name suggestions." },
  { icon: <FaClipboardList className="text-blue-500 text-3xl" />, title: "Legal Setup & Paperwork", desc: "Company registration, GST, UDYAM, MSME, PAN, and licenses." },
  { icon: <FaMoneyCheckAlt className="text-green-500 text-3xl" />, title: "Business Funding & Finance", desc: "Loan schemes, capital planning & accounting system setup." },
  { icon: <FaPaintBrush className="text-red-500 text-3xl" />, title: "Branding & Design", desc: "Logo, visiting card, packaging & brand story." },
  { icon: <FaGlobe className="text-purple-500 text-3xl" />, title: "Online Presence & Website", desc: "Website setup, Google My Business & social media." },
  { icon: <FaBullhorn className="text-indigo-500 text-3xl" />, title: "Marketing & Promotion", desc: "Flyers, social media ads, SEO & influencer outreach." },
  { icon: <FaUserCheck className="text-teal-500 text-3xl" />, title: "Lead Generation & CRM", desc: "Getting leads, CRM setup & follow-up strategies." },
  { icon: <FaRocket className="text-orange-500 text-3xl" />, title: "Business Growth & Support", desc: "Revenue planning, expansion ideas & continuous support." },
];

const BusinessConsultation = () => {
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
            const res = await PostRequest("addBusinessConsultation", data);
        
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
      <img src="/images/ca-service.jpg" width={1200} height={400} alt="Audit & Accounting Services" className="rounded-lg shadow-lg" />
    </div>
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Business Consultation & Launch Support</h1>
        <p className="text-gray-600 mt-2">Helping Small Businesses Start, Grow & Succeed</p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {modules.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
            {item.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Program Features */}
      <div className="mt-10 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800">🎁 Program Features</h2>
        <ul className="text-gray-700 mt-2 list-disc list-inside">
          <li>📅 Duration: 30 Days / Fast Track in 15 Days</li>
          <li>🧑‍🏫 One-on-One Mentorship + Group Sessions</li>
          <li>📃 All Templates, Formats & Designs Provided</li>
          <li>📲 Full Support via Call / WhatsApp / Video</li>
          <li>🧾 GST Invoice + Certification of Completion</li>
        </ul>
      </div>

      {/* Who Should Join */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800">🛠️ Who Should Join?</h2>
        <ul className="text-gray-700 mt-2 list-disc list-inside">
          <li>Small Business Starters (Shop, Online Seller, Service Provider)</li>
          <li>Local Traders, Retailers, Freelancers</li>
          <li>Women Entrepreneurs, Students, Homepreneurs</li>
        </ul>
      </div>

      {/* Contact Section */}
      <div className="text-center mt-8">
        <h2 className="text-xl font-semibold text-gray-800">📞 Ready to Build Your Dream Business?</h2>
        {/* <p className="text-gray-700 mt-2">📍 Offices in: [Your City Names]</p>
        <p className="text-gray-700">📲 Call: +91-XXXXXXXXXX | 🌐 [YourWebsite.com]</p> */}
       
      </div>
    </div>
<div className="bg-[#FF7F00] min-h-screen flex items-center justify-center px-4 py-10">
  <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
    
    {/* Left Side Image */}
    <div className="md:w-1/2 w-full h-64 md:h-auto">
      <img
        src="/images/ca-service.jpg"
        alt="Real Estate Services"
        className="object-cover w-full h-full"
      />
    </div>

    {/* Right Side Form */}
    <div className="md:w-1/2 w-full p-8 md:p-10">
      <h1 className="text-3xl font-bold text-[#4C1F7A] text-center mb-8">
      Business Consultation
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

export default BusinessConsultation;
