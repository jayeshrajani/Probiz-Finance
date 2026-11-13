import React, { useState } from 'react'
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';
import { PostRequest } from '../components/api-handler';
import swal from "sweetalert";
import { useRouter } from "next/router";
const loanSchemes = [
  {
    title: "Pradhan Mantri Mudra Yojana (PMMY)",
    description:
      "This scheme offers collateral-free loans up to ₹10 lakhs to non-corporate, non-farm small/micro enterprises.",
    categories: [
      "Shishu: Up to ₹50,000",
      "Kishor: ₹50,000 to ₹5 lakhs",
      "Tarun: ₹5 lakhs to ₹10 lakhs",
    ],
    eligibility:
      "Small manufacturers, service sector units, shopkeepers, fruit/vegetable vendors, truck operators, food-service units, repair shops, machine operators, small industries, artisans, food processors, etc.",
  },
  {
    title: "Stand-Up India Scheme",
    description:
      "Provides loans ranging from ₹10 lakhs to ₹1 crore to SC/ST and women entrepreneurs for setting up new enterprises.",
    eligibility:
      "SC/ST or women entrepreneurs holding at least 51% stake in a new business or partnership firm.",
  },
  {
    title: "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
    description:
      "Offers collateral-free credit to micro and small enterprises (MSEs).",
    eligibility:
      "New and existing MSEs (excluding retail trade, educational institutions, agriculture, and SHGs).",
  },
  {
    title: "SIDBI Make in India Soft Loan Fund for MSMEs (SMILE)",
    description:
      "Provides soft loans to new and existing MSMEs for business expansion.",
    eligibility:
      "New and existing enterprises in manufacturing and service sectors.",
  },
  {
    title: "Bank Credit Facilitation Scheme (by NSIC)",
    description:
      "Implemented by NSIC, this scheme helps MSMEs obtain credit support from banks without additional fees.",
    eligibility: "Registered MSMEs across India.",
  },
  {
    title: "Prime Minister’s Employment Generation Programme (PMEGP)",
    description:
      "Provides financial assistance to establish new micro-enterprises.",
    eligibility:
      "Individuals above 18 years of age looking to set up a new enterprise.",
  },
];

export default function GovernmentBusinessServices() {
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
    const res = await PostRequest("addGovernmentBusinessService", data);

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
      <HeaderSec />
      <div className="container mx-auto py-12 px-6">
        <div className="w-full flex justify-center mb-8">
          <img src="/images/govnt.jpg" width={1200} height={400} alt="Government Business Loan Schemes" className="rounded-lg shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">Government Business Loan Schemes in India</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loanSchemes.map((scheme, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">{scheme.title}</h2>
              <p className="text-gray-600 mb-2">{scheme.description}</p>
              {scheme.categories && (
                <ul className="list-disc list-inside text-gray-700 mb-2">
                  {scheme.categories.map((category, idx) => (
                    <li key={idx}>{category}</li>
                  ))}
                </ul>
              )}
              <p className="text-gray-700 font-medium">Eligibility: {scheme.eligibility}</p>
            </div>
          ))}
        </div>
      </div>

       <div className="bg-[#FF7F00] min-h-screen flex items-center justify-center px-4 py-10">
  <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
    
    {/* Left Side Image */}
    <div className="md:w-1/2 w-full h-64 md:h-auto">
      <img
        src="/images/legal.jpg"
        alt="Real Estate Services"
        className="object-cover w-full h-full"
      />
    </div>

    {/* Right Side Form */}
    <div className="md:w-1/2 w-full p-8 md:p-10">
      <h1 className="text-3xl font-bold text-[#4C1F7A] text-center mb-8">
        Government Business Loan
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
      <Footer />
    </>
  );
}
