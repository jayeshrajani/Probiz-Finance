import React, { useState } from 'react';
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';
import { PostRequest } from '../components/api-handler';
import swal from "sweetalert";
import { useRouter } from "next/router";
const CreditScore = () => {
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
        const res = await PostRequest("addCreditScoreService", data);
    
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
    <div className="max-w-6xl mx-auto my-8 p-6  rounded-lg ">
      {/* Top Image */}
      <div className="w-full flex justify-center mb-8">
        <img
          src="/images/credit-score.jpg" // Replace with actual image path
          alt="Credit Score Banner"
          width={1200}
          height={400}
          className="rounded-lg"
        />
      </div>

      <h1 className="text-2xl font-bold text-center">
        India’s First DSA Platform Offering Free Credit Score Check!
      </h1>
      <p className="text-gray-700 text-center mt-2">
        Only at Probiz Finance – Empowering Smart Borrowers
      </p>

      {/* Grid Layout for Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why This is a Game-Changer */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">🎯 Why This is a Game-Changer for You?</h2>
          <p className="text-gray-600 mt-2">
            Forget waiting in banks or paying hefty charges just to check your credit score.
            Now check your credit score instantly – right from our loan DSA platform!
          </p>
        </div>

        {/* What You Get */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">📊 What You Get – Instantly & Free!</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Your Real-Time Credit Score (CIBIL / Experian / Equifax)</li>
            <li>Loan Eligibility Insights</li>
            <li>Existing Loan Summary & Credit Health Snapshot</li>
            <li>Pre-assessment for Personal, Business & Home Loans</li>
            <li>Takes less than 30 seconds. No impact on your score</li>
          </ul>
        </div>

        {/* Downloadable Report */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">🧾 Want a Downloadable Official Credit Report?</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Complete PDF Report with Loan History</li>
            <li>Overdue Accounts, DPDs, Settled Accounts Info</li>
            <li>Useful for loan sanctioning, property deals, personal records</li>
          </ul>
        </div>

        {/* ₹99 Pricing Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">💰 Get it for just ₹99 only (No hidden fees)</h2>
          <h3 className="text-lg font-semibold text-gray-700 mt-2">💡 Why We Charge ₹99 for Download?</h3>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>✔️ Official credit report in your inbox</li>
            <li>✔️ Verified report from authorized bureaus</li>
            <li>✔️ Priority support from our Credit Experts</li>
            <li>✔️ Loan Pre-Eligibility Suggestions – FREE!</li>
          </ul>
          <p className="text-gray-700 mt-2">
            And yes – ₹99 will be adjusted in your file processing if you apply with us.
          </p>
        </div>

        {/* Security Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">🔐 100% Secure. 100% Private.</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>🔒 Your data is encrypted</li>
            <li>🔒 We never share your info with third parties</li>
            <li>🔒 Trusted by 10,000+ smart borrowers like you</li>
          </ul>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow text-start">
        <h2 className="text-xl font-semibold text-gray-800">🚀 Experience the DSA Revolution – Only with Probiz!</h2>
        <p className="text-gray-700 mt-2">
          📍 No Bank Offers This. No Other DSA Has This.
        </p>
        <p className="text-gray-700">✅ We’re not just a DSA – we’re a complete financial ecosystem.</p>

        
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

export default CreditScore;
