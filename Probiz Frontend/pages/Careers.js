// import React from 'react'
// import Header from '../components/common-component/Header'
// import Footer from '../components/common-component/Footer'

// export default function Careers() {
//     return (
//         <div className="min-h-screen flex flex-col bg-gray-50">
//             <Header />

//             <main className="flex-1">
                
//                 {/* Title */}
//                 <section className="text-center py-10 bg-[#FF7F00] text-white">
//                     <h1 className="text-4xl font-bold">Careers</h1>
//                 </section>
                

//                 {/* Content Box */}
//                 <section className="max-w-5xl mx-auto px-5 py-10">
//                     <div className="bg-white p-8 shadow-md rounded-xl border border-gray-200 leading-relaxed text-gray-800">

//                         <h2 className="text-2xl font-semibold mb-4">
//                             📌 Probiz Finance – Statewide Hiring Across Madhya Pradesh
//                         </h2>

//                         <p className="mb-6">
//                             We are expanding our fintech footprint across the state and onboarding high-performance talent 
//                             for our B2C and B2B lending verticals. All positions include structured training, 
//                             multi-bank product exposure, and a fast-track growth path.
//                         </p>

//                         {/* Job 1 */}
//                         <h3 className="text-xl font-semibold mb-2">1️⃣ Relationship Executive – B2C (Retail Loan Acquisition)</h3>

//                         <p><strong>Vacancies:</strong> 2 Positions in Every Listed City</p>
//                         <p><strong>Experience:</strong> 1–3 Years</p>
//                         <p className="mb-4"><strong>CTC:</strong> ₹2.4 LPA – ₹3.6 LPA + Incentives</p>

//                         <h4 className="font-semibold">Role Overview</h4>
//                         <p className="mb-3">
//                             This role focuses on direct consumer acquisition, field sourcing, and delivering monthly disbursement outcomes 
//                             across Personal Loans, Business Loans, Auto Loans, LAP and other lending products.
//                         </p>

//                         <h4 className="font-semibold">Key Responsibilities</h4>
//                         <ul className="list-disc list-inside mb-3 space-y-1">
//                             <li>Open-market sourcing and daily customer acquisition</li>
//                             <li>Lead management & CRM updates</li>
//                             <li>Eligibility assessment, documentation, coordination with banking partners</li>
//                             <li>Achievement of monthly disbursement targets</li>
//                             <li>Customer servicing & referral generation</li>
//                         </ul>

//                         <h4 className="font-semibold">Ideal Candidate</h4>
//                         <ul className="list-disc list-inside mb-8 space-y-1">
//                             <li>Experience in Banking/NBFC/Fintech loan sales</li>
//                             <li>Strong open-market sourcing ability</li>
//                             <li>Communication & relationship-building strength</li>
//                         </ul>


//                         {/* Job 2 */}
//                         <h3 className="text-xl font-semibold mb-2">2️⃣ Manager – Channel Partnerships & Team Leadership</h3>

//                         <p><strong>Experience:</strong> 3–7 Years</p>
//                         <p className="mb-4"><strong>CTC:</strong> ₹3.6 LPA – 6 LPA + Incentives</p>

//                         <h4 className="font-semibold">Role Overview</h4>
//                         <p className="mb-3">
//                             This role is responsible for building the B2B connector lobby (DSAs, CAs, car dealers, builders, 
//                             freelancers), driving channel productivity, and leading the Relationship Executive team.
//                         </p>

//                         <h4 className="font-semibold">Key Responsibilities</h4>
//                         <ul className="list-disc list-inside mb-3 space-y-1">
//                             <li>Onboard & manage DSAs, CAs, builders, dealers & business partners</li>
//                             <li>Lead & mentor the executive team</li>
//                             <li>Achieve cluster-wise disbursement targets</li>
//                             <li>MIS, reporting, compliance, documentation quality monitoring</li>
//                             <li>Partner relationship management & performance reviews</li>
//                         </ul>

//                         <h4 className="font-semibold">Ideal Candidate</h4>
//                         <ul className="list-disc list-inside mb-8 space-y-1">
//                             <li>Strong network in banking/fintech DSA ecosystem</li>
//                             <li>Team leadership experience</li>
//                             <li>Deep knowledge of loan products, credit policies & partner handling</li>
//                         </ul>


//                         {/* Cities */}
//                         <h3 className="text-xl font-semibold mb-3">📍 Cities Where Hiring Is Open (2 Executives Per City)</h3>

//                         <p className="mb-4">We are currently hiring across the following cities within Madhya Pradesh:</p>

//                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
//                             {[
//                                 "Indore", "Rau", "Dewas", "Sonkatch", "Ashta", "Maksi", "Shajapur",
//                                 "Ujjain", "Agar", "Nagda", "Jaora", "Depalpur", "Badnawar",
//                                 "Ratlam", "Betma", "Dhar"
//                             ].map(city => (
//                                 <div key={city} className="bg-gray-100 p-2 rounded-md text-center font-medium">
//                                     {city}
//                                 </div>
//                             ))}
//                         </div>

//                     </div>
//                 </section>
//             </main>

//             <Footer />
//         </div>
//     )
// }


import React from 'react';
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';

const Careers = () => {
  return (
    <>
      <HeaderSec />

      <div className="max-w-6xl mx-auto px-4 py-20 text-gray-800">
        
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-6">Careers</h1>

        {/* Intro Content */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">
            Probiz Finance – Statewide Hiring Across Madhya Pradesh
          </h2>
          <p className="leading-relaxed">
            We are expanding our fintech footprint across the state and onboarding
            high-performance talent for our B2C and B2B lending verticals. All
            positions include structured training, multi-bank product exposure,
            and a fast-track growth path.
          </p>
        </div>

        {/* Render Job Sections */}
        {careerSections.map((section, index) => (
          <div key={index} className="mb-10">
            <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
            
            {section.items.map((item, idx) => (
              <p key={idx} className="mb-2">{item}</p>
            ))}
          </div>
        ))}

        {/* Cities Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-3">
            Cities Where Hiring Is Open (2 Executives Per City)
          </h2>

          <p className="mb-6">
            We are currently hiring across the following cities within Madhya Pradesh:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cities.map((city, i) => (
              <div
                key={i}
                className="bg-gray-100 p-3 rounded-lg shadow-sm text-center font-medium"
              >
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};


// ================== CAREER SECTIONS CONTENT ==================

const careerSections = [
  {
    title: "1️⃣ Relationship Executive – B2C (Retail Loan Acquisition)",
    items: [
      "Vacancies: 2 Positions in Every Listed City",
      "Experience: 1–3 Years",
      "CTC: ₹2.4 LPA – ₹3.6 LPA + Incentives",
      "",
      "Role Overview:",
      "This role focuses on direct consumer acquisition, field sourcing, and delivering monthly disbursement outcomes across Personal Loans, Business Loans, Auto Loans, LAP, and other lending products.",
      "",
      "Key Responsibilities:",
      "- Open-market sourcing and daily customer acquisition",
      "- Lead management & CRM updates",
      "- Eligibility assessment, documentation, coordination with banking partners",
      "- Achievement of monthly disbursement targets",
      "- Customer servicing & referral generation",
      "",
      "Ideal Candidate:",
      "- Experience in Banking/NBFC/Fintech loan sales",
      "- Strong open-market sourcing ability",
      "- Communication & relationship-building strength"
    ],
  },

  {
    title: "2️⃣ Manager – Channel Partnerships & Team Leadership",
    items: [
      "Experience: 3–7 Years",
      "CTC: ₹3.6 LPA – 6 LPA + Incentives",
      "",
      "Role Overview:",
      "This role is responsible for building the B2B connector lobby (DSAs, CAs, car dealers, builders, freelancers), driving channel productivity, and leading the Relationship Executive team.",
      "",
      "Key Responsibilities:",
      "- Onboard & manage DSAs, CAs, builders, dealers & business partners",
      "- Lead & mentor the executive team",
      "- Achieve cluster-wise disbursement targets",
      "- MIS, reporting, compliance, documentation quality monitoring",
      "- Partner relationship management & performance reviews",
      "",
      "Ideal Candidate:",
      "- Strong network in banking/fintech DSA ecosystem",
      "- Team leadership experience",
      "- Deep knowledge of loan products, credit policies & partner handling"
    ],
  },
];


// ================== HIRING CITIES ==================

const cities = [
  "Indore", "Rau", "Dewas", "Sonkatch", "Ashta", "Maksi", "Shajapur", "Ujjain",
  "Agar", "Nagda", "Jaora", "Depalpur", "Badnawar", "Ratlam", "Betma", "Dhar"
];

export default Careers;

