import React, { useState } from 'react'
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';
import { PostRequest } from '../components/api-handler';
import swal from "sweetalert";
import { useRouter } from "next/router";
const services = [
  {
    title: "Registry Services (पंजीकरण सेवाएं)",
    description: "Legal registration of property documents as per Indian Registration Act, 1908.",
    useCases: [
      "Sale Deed Registration: For buying/selling property",
      "Gift Deed Registration: For gifting property to relatives",
      "Lease Deed Registration: Commercial/Residential lease above 11 months",
      "Power of Attorney (POA): Legal rights transfer to another person",
      "Property Partition Deed: Distribution of ancestral or joint property",
      "Builder Buyer Agreement: Flat booking documentation",
      "Land Registration: Agriculture/Plot/Land Purchase Registration",
      "Joint Development Agreement (JDA): Developer agreements with landowners"
    ],
    deliverables: "Registered Deed, Index-2 Copy, Stamp Duty & Registration Receipt",
    jurisdiction: "Sub-Registrar Office (SRO) of respective area"
  },
  {
    title: "Notary Services (नोटरी सेवाएं)",
    description: "Official attestation of documents to verify authenticity & legality.",
    useCases: [
      "Affidavit Notarization: Name Change, Address Proof, DOB correction",
      "Rental Agreement Notary: For less than 11-month rent contracts",
      "Declaration Notary: General declarations (legal, property, etc.)",
      "Educational Certificate Attest: Bonafide, Transfer Certificate, Marksheet, etc.",
      "Business Agreement Notary: Partnership, NDA, Authorization letters"
    ],
    validity: "Notarized documents are legally valid for use in government & private sectors",
    authorizedBy: "Government-authorized Notary Public"
  },
  {
    title: "E-Stamp Services (ई-स्टैम्प सेवा)",
    description: "Digitally issued non-judicial stamp papers through SHCIL-authorized centers.",
    useCases: [
      "₹10 / ₹50 / ₹100: Affidavits, Agreements, Undertakings",
      "₹500 / ₹1000: Lease Agreements, Business Agreements",
      "₹2000 / ₹5000 / ₹10,000+: Property Sale, Partnership Deeds, Loan Documents"
    ],
    features: [
      "Tamper-proof digital issue",
      "Verifiable through official SHCIL portal",
      "Instant delivery in PDF or print format"
    ],
    deliveryOptions: "Hardcopy with seal or soft copy via Email/WhatsApp"
  }
];

const whyChooseUs = [
  "Fast & Transparent Processing",
  "Doorstep Document Pickup (Optional)",
  "Expert Legal Guidance",
  "Pan India Network with Local Office Support",
  "Affordable Charges & GST Invoice"
];

export default function RegistrationServices() {
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
          const res = await PostRequest("addLegalDocumentationService", data);
        
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
        <img src="/images/legal.jpg" width={1200} height={400} alt="Legal & Registration Services" className="rounded-lg shadow-lg" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-8">Legal Documentation & Registration Services</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
            <h2 className="text-xl font-semibold mb-4">{service.title}</h2>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {service.useCases.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            {service.deliverables && <p className="mt-4 text-gray-700 font-semibold">Deliverables: {service.deliverables}</p>}
            {service.jurisdiction && <p className="text-gray-700">Jurisdiction: {service.jurisdiction}</p>}
            {service.validity && <p className="text-gray-700">Validity: {service.validity}</p>}
            {service.authorizedBy && <p className="text-gray-700">Authorized By: {service.authorizedBy}</p>}
            {service.features && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Features:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            {service.deliveryOptions && <p className="mt-4 text-gray-700 font-semibold">Delivery: {service.deliveryOptions}</p>}
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
        src="/images/legal.jpg"
        alt="Real Estate Services"
        className="object-cover w-full h-full"
      />
    </div>

    {/* Right Side Form */}
    <div className="md:w-1/2 w-full p-8 md:p-10">
      <h1 className="text-3xl font-bold text-[#4C1F7A] text-center mb-8">
        Registration Services
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
