import React, { useState } from 'react'
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';
import { PostRequest } from '../components/api-handler';
import swal from "sweetalert";
import { useRouter } from "next/router";
const services = [
  {
    title: "Audit & Assurance Services",
    image: "/images/audit.jpg",
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
    image: "/images/accounting.jpg",
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
    title: "Direct & Indirect Taxation Services",
    image: "/images/taxation.jpg",
    items: [
      "Direct Taxation Advisory (including Transfer Pricing & BEPS Compliance)",
      "GST Compliance (Return filing, reconciliation, refund applications, etc.)",
      "GST Litigation Support (DRC-01A, Appeals up to Tribunal)",
      "Tax Representation Services (Income Tax/GST/Customs)",
      "International Taxation & NRI Taxation",
      "Corporate Tax Strategy and Planning",
      "TDS/TCS Compliances & Advisory",
      "Advance Rulings, Anti-Profiteering & GST Audit Services"
    ]
  },
  {
    title: "Regulatory Compliance & Corporate Law Services",
    image: "/images/compliance.jpg",
    items: [
      "Company Incorporation (India & Outside India)",
      "Secretarial Compliances (ROC Filings, Board Resolutions, Minutes, etc.)",
      "FEMA & RBI Compliances (FDI, ODI, ECB Reporting)",
      "Representation in NCLT/NCLAT proceedings (Mergers & Restructuring cases)",
      "Compliance under the Labour & Employment Laws",
      "POSH Policy drafting and related compliance"
    ]
  },
  {
    title: "Business Setup & Expansion Services",
    image: "/images/business.jpg",
    items: [
      "Incorporation of LLP, Pvt Ltd, OPC, Section 8 Companies",
      "Company Setup Outside India (Mainland, Freezone, Offshore)",
      "Branch Office/Liaison Office Registrations (FEMA Compliances)",
      "Startup India Registration & DPIIT Certification",
      "Business Licenses & Approvals (Shops & Establishments, GST, Import Export Code, etc.)",
      "Corporate Structuring & Business Reorganization Advisory"
    ]
  },
  {
    title: "Virtual CFO & Business Advisory Services",
    image: "/images/cfo.jpg",
    items: [
      "End-to-End Virtual CFO Services for SMEs and Startups",
      "Financial Projections, Cash Flow, and Business Valuation",
      "Investor Pitch Deck Preparation & Fundraising Support",
      "ERP Implementation Advisory (SAP, Tally Prime, Zoho Books)",
      "Cost Control & Profitability Improvement Consulting",
      "MIS Reporting & Financial KPIs Dashboarding",
      "SOP Development for Business Processes"
    ]
  },
  {
    title: "International Business Advisory",
    image: "/images/international.jpg",
    items: [
      "Cross Border Taxation & DTAA Advisory",
      "Global Entity Structuring & Compliance Management",
      "Transfer Pricing Documentation & Master File Preparation",
      "Advice on Permanent Establishment (PE) Risk",
      "Offshore Structures and Holding Companies Setup"
    ]
  },
  {
    title: "Litigation & Representation Services",
    image: "/images/litigation.jpg",
    items: [
      "Tax Litigation: CIT(A), ITAT, GST Tribunal, High Court coordination",
      "Reply to Tax Notices, Departmental Queries, Show Cause Notices (GST & IT)",
      "Compounding & Amnesty Scheme Advisory",
      "Representation before SEBI, RBI, SFIO & Other Regulatory Bodies"
    ]
  },
  {
    title: "Transaction & Investment Advisory",
    image: "/images/transaction.jpg",
    items: [
      "Due Diligence (Financial, Tax, Legal)",
      "Mergers, Demergers & Restructuring Advisory",
      "Business Valuations & Fairness Opinions",
      "Private Equity and Venture Capital Funding Support",
      "Deal Negotiation & Transaction Support"
    ]
  }
];

export default function Services() {
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
    const res = await PostRequest("addCaServices", data);
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
      <HeaderSec />
      <div className="container mx-auto py-12 px-6">
        <div className="w-full flex justify-center mb-8">
          <img src="/images/ca-service.jpg" width={1200} height={400} alt="Audit & Accounting Services" className="rounded-lg shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">CA Services</h1>
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
      </div>
      <div>
       <div className="bg-[#FF7F00] min-h-screen flex items-center justify-center px-4 py-10">
  <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
    
    {/* Left Side Image */}
    <div className="md:w-1/2 w-full h-64 md:h-auto">
      <img
        src="/images/ca-service.jpg"
        alt="CA Services"
        className="object-cover w-full h-full"
      />
    </div>

    {/* Right Side Form */}
    <div className="md:w-1/2 w-full p-8 md:p-10">
      <h1 className="text-3xl font-bold text-[#4C1F7A] text-center mb-8">
        CA Services
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

      </div>
      <Footer />
    </>
  );
}
