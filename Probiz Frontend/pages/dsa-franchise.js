import Image from "next/image";
import HeaderSec from "../components/common-component/HeaderSec";
import Footer from "../components/common-component/Footer";
import { useState } from "react";
import { PostRequest } from "../components/api-handler";
import swal from "sweetalert";
import { useRouter } from "next/router";
const franchiseDetails = {
  title: "Become a Franchise Partner with Probiz Management Services",
  subtitle: "Join India's fastest-growing Loan DSA Franchise Network",
  benefits: [
    "Pre-qualified leads directly from our website",
    "Access to CRM & lead management system",
    "Exclusive territory rights for your city",
    "Ready tie-ups with leading Banks & NBFCs",
    "Sales & process training for you and your team",
    "Full backend and marketing support",
    "Scalable business model with minimal risk"
  ],
  franchiseModel: [
    "Setup your own Loan DSA office in your city",
    "We provide verified leads from our centralized lead generation system",
    "You focus on lead conversion & customer relationship",
    "Earn commissions on loans + cross-sell insurance & other financial products",
    "Ongoing training and technology support"
  ],
  investment: [
    "One-Time Franchise Fee: ₹1.5 lakh to ₹3 lakh (depending on city)",
    "Optional Monthly Tech & Marketing Fee: ₹10,000/month",
    "Royalty: 10%-20% of your earned commissions",
    "Earnings Potential: ₹1 lakh to ₹5 lakh+ monthly (based on lead conversion)"
  ],
  eligibility: [
    "Existing loan agents, financial advisors, or entrepreneurs",
    "Professionals with good networking & sales skills",
    "Ability to invest in a small office setup and basic team",
    "Passion for customer service and ethical business practices"
  ],
  support: [
    "Centralized lead generation from website & digital ads",
    "CRM access for lead management",
    "Loan product training (Personal Loan, Home Loan, Business Loan, etc.)",
    "Branding & marketing collateral",
    "Dedicated relationship manager for ongoing support",
    "Assistance in onboarding with banks & NBFCs"
  ]
};

export default function FranchisePartner() {
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
        const res = await PostRequest("addDsaServices", data);
      
        if(res.status === true){
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
        <img src="/images/dsa.jpg" width={1200} height={400} alt="Franchise Partnership" className="rounded-lg shadow-lg" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-4">{franchiseDetails.title}</h1>
      <p className="text-lg text-center text-gray-600 mb-8">{franchiseDetails.subtitle}</p>
      
      {/* Benefits Section */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-center mb-4">Why Partner with Us?</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {franchiseDetails.benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>

      {/* Franchise Model Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
          <h2 className="text-xl font-semibold mb-4">Franchise Model Overview</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {franchiseDetails.franchiseModel.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
          <h2 className="text-xl font-semibold mb-4">Investment & Earnings</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {franchiseDetails.investment.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Eligibility & Support */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Who Can Apply?</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {franchiseDetails.eligibility.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">How We Support You</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {franchiseDetails.support.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to Start?</h2>
        <p className="text-gray-600 mb-4">Become an exclusive Loan DSA Franchise Partner in your city.</p>
        <p className="text-xl font-semibold mt-4">‘Hum Leads Denge, Aap Business Banaiye!’</p>
      </div>
    </div>

       <div className="bg-[#FF7F00] min-h-screen flex items-center justify-center px-4 py-10">
  <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
    
    {/* Left Side Image */}
    <div className="md:w-1/2 w-full h-64 md:h-auto">
      <img
        src="/images/dsa.jpg"
        alt="Real Estate Services"
        className="object-cover w-full h-full"
      />
    </div>

    {/* Right Side Form */}
    <div className="md:w-1/2 w-full p-8 md:p-10">
      <h1 className="text-3xl font-bold text-[#4C1F7A] text-center mb-8">
        DSA Franchise
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
}
