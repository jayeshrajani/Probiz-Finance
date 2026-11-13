import React, { useState } from 'react'
import Footer from '../components/common-component/Footer';
import HeaderSec from '../components/common-component/HeaderSec';
import { PostRequest } from '../components/api-handler';
import swal from "sweetalert";
import { useRouter } from "next/router";
const services = [
  {
    title: "Audit & Assurance Services",
    items: [
      "Statutory Audit under Companies Act, 2013",
      "Internal Financial Control (IFC) Audits",
      "Tax Audit under Section 44AB of Income Tax Act",
      "Forensic and Investigation Audits",
      "Due Diligence Reviews",
      "Risk-Based Internal Audit",
      "Corporate Governance Review",
      "Compliance Audit (Statutory, Regulatory, and Process)",
      "Environmental Social Governance Reporting and Sustainability Audit"
    ]
  },
  {
    title: "Accounting & Bookkeeping Services",
    items: [
      "Cloud-based Bookkeeping & Automation",
      "Accounts Outsourcing & Virtual Accounting",
      "Preparation of Management Accounts (MIS) and Budgeting",
      "Financial Reporting as per Ind AS, IFRS & US GAAP",
      "Backlog Accounting & Books Cleanup",
      "Standard Operating Procedures (SOP) Implementation for Accounts Department",
      "Accounts Payable & Receivable Management"
    ]
  },
  {
    title: "Real Estate Services",
    items: [
      "Property Buying Assistance: Site visit, legal check, builder verification, registry support",
      "Property Selling Services: Verified buyers, market valuation, digital listing",
      "Flat / Apartment Booking: Collaboration with top builders – special discounts & offers",
      "Home Loan Coordination: Fast loan processing through 30+ banks/NBFCs",
      "Plot Purchase Support: Legal land check, development approval & title clarity"
    ]
  },
  {
    title: "Commercial Property Services",
    items: [
      "Office / Shop Lease: Location scouting, agreement drafting, registration support",
      "Commercial Property Buying: Investment advisory, rental yield estimation",
      "Co-Working Space Setup: Legal setup, branding, infrastructure advisory",
      "Retail Space Consulting: Mall leasing, franchise location analysis"
    ]
  },
  {
    title: "Agricultural & Farm Land Services",
    items: [
      "Agricultural Land Purchase: Land title verification, demarcation, conversion support",
      "Farm House Projects: Land selection, layout planning, Vastu consultation",
      "NA Land / Conversion Service: Agricultural to Residential/Commercial land conversion consultancy"
    ]
  },
  {
    title: "NRI & Investment Services",
    items: [
      "Property Management for NRIs: End-to-end rental management, site inspection, maintenance",
      "Investment Planning: ROI-focused land or flat investments with exit strategy",
      "Legal Due Diligence: Property verification, POA registration, dispute check"
    ]
  },
  {
    title: "Legal & Documentation Services",
    items: [
      "Sale Deed Drafting & Registration",
      "Stamp Duty & E-Stamp Paper Assistance",
      "Mutation, Khasra-Khatauni, Patwari Work",
      "Power of Attorney & NOC Documentation"
    ]
  }
];

const whyChooseUs = [
  "Trusted Real Estate Advisors",
  "Strong Network with Verified Builders",
  "Expert Legal & Loan Support",
  "Transparent Dealings & Digital Documentation",
  "One-stop Solution from Plot to Possession"
];

export default function RealEstateServices() {
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
      const res = await PostRequest("addRealStateServices", data);
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
        <img src="/images/real-estate.jpg" width={1200} height={400} alt="Audit & Real Estate Services" className="rounded-lg shadow-lg" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-8">Real Estate Services</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
            <h2 className="text-xl font-semibold mb-4">{service.title}</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {service.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 bg-gray-100 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Why Choose Us?</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 text-start">
          {whyChooseUs.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        
      </div>
    </div>
    <div className="bg-[#FF7F00] min-h-screen flex items-center justify-center px-4 py-10">
  <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
    
    {/* Left Side Image */}
    <div className="md:w-1/2 w-full h-64 md:h-auto">
      <img
        src="/images/real-estate.jpg"
        alt="Real Estate Services"
        className="object-cover w-full h-full"
      />
    </div>

    {/* Right Side Form */}
    <div className="md:w-1/2 w-full p-8 md:p-10">
      <h1 className="text-3xl font-bold text-[#4C1F7A] text-center mb-8">
        Real Estate Services
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
