import React, { useState } from "react";
import HeaderSec from "../components/common-component/HeaderSec";
import Footer from "../components/common-component/Footer";
import swal from "sweetalert";
import { useRouter } from "next/router";
// Services Data
const services = [
    {
      title: "Social Media Marketing",
      icon: "📱",
      details: [
        "Facebook, Instagram, LinkedIn, YouTube Setup",
        "Creative Post Designing & Scheduling",
        "Targeted Ad Campaigns & Hashtag Strategy",
      ],
    },
    {
      title: "SEO & SEM",
      icon: "🔍",
      details: [
        "On-Page & Off-Page SEO Optimization",
        "Google Ads & PPC Campaign Management",
        "Keyword Research & Monthly Reporting",
      ],
    },
    {
      title: "Website Development",
      icon: "💻",
      details: [
        "Business & E-commerce Websites",
        "Mobile Responsive & SEO-Friendly",
        "WhatsApp & Payment Integration",
      ],
    },
    {
      title: "WhatsApp & SMS Marketing",
      icon: "✉️",
      details: [
        "Bulk WhatsApp & SMS Campaigns",
        "Lead Follow-up Automation",
        "CRM Integration (Optional)",
      ],
    },
    {
      title: "Branding & Graphic Design",
      icon: "🎨",
      details: [
        "Logo, Poster, Banner & Visiting Card Design",
        "Festival & Promotional Creatives",
        "Ad Creatives for Facebook & Google",
      ],
    },
    {
      title: "Mobile App Development",
      icon: "📲",
      details: [
        "Custom Android & iOS Apps",
        "User-Friendly UI/UX Design",
        "App Store Publishing & ASO",
      ],
    },
  ];
const DigitalMarketingServices = () => {
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
      const res = await PostRequest("addDigitalMarketingService", data);
  
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
      <img src="/images/digital-marketing.jpg" width={1200} height={400} alt="Audit & Accounting Services" className="rounded-lg shadow-lg" />
    </div>
    <h1 className="text-3xl font-bold text-center mb-8">Digital Marketing & App Development Services</h1>

      {/* Services Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full">
                {service.icon}
              </div>
              <h2 className="text-xl font-semibold">{service.title}</h2>
            </div>
            <ul className="mt-3 space-y-2 text-gray-600">
              {service.details.map((detail, idx) => (
                <li key={idx} className="flex items-start">
                  ✅ {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Why Choose Us */}
      <div className="bg-white p-8 mt-10 rounded-xl shadow-md ">
        <h2 className="text-2xl font-bold text-center">Why Choose Us?</h2>
        <ul className="mt-4 space-y-2 text-gray-700 text-start">
          <li>✅ End-to-End Service from Strategy to Execution</li>
          <li>✅ Creative & Experienced Digital & App Team</li>
          <li>✅ Performance-Focused Marketing & Tech Plans</li>
          <li>✅ Affordable Packages for Startups & MSMEs</li>
          <li>✅ Monthly Reporting & Transparent Communication</li>
        </ul>
      </div>

      {/* Contact Section */}
      <div className="text-center mt-10">
        <h3 className="text-xl font-semibold">📞 Let’s Build Your Brand & App Online!</h3>
      </div>
    </div>
    <div className="bg-[#FF7F00] min-h-screen flex items-center justify-center px-4 py-10">
  <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
    
    {/* Left Side Image */}
    <div className="md:w-1/2 w-full h-64 md:h-auto">
      <img
        src="/images/digital-marketing.jpg"
        alt="Real Estate Services"
        className="object-cover w-full h-full"
      />
    </div>

    {/* Right Side Form */}
    <div className="md:w-1/2 w-full p-8 md:p-10">
      <h1 className="text-3xl font-bold text-[#4C1F7A] text-center mb-8">
      Digital Marketing Service
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



export default DigitalMarketingServices;
