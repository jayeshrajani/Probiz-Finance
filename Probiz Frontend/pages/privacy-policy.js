import React from 'react';
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';

const PrivacyPolicy = () => {
  return (
    <>
    <HeaderSec/>
    <div className="max-w-6xl mx-auto px-4 py-20 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Effective Date: 28/05/2025</p>

      <p className="mb-6">
        At ProBiz Management Services, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website (<a href="https://probizfinance.com" className="text-blue-600 underline">https://probizfinance.com</a>) or engage with our services.
      </p>

      {sections.map((section, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
          {section.content.map((para, i) => (
            <p key={i} className="mb-2 whitespace-pre-wrap">{para}</p>
          ))}
        </div>
      ))}
    </div>
    <Footer/>
    </>
  );
};

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "We may collect the following types of information:\n\nPersonal Information: Name, email address, phone number, company name, and other details you provide when contacting us or filling out forms.\n\nUsage Data: Information about how you access and use our website, including IP address, browser type, pages visited, and time spent.\n\nCookies and Tracking Technologies: We use cookies and similar tools to enhance user experience, analyze website performance, and deliver relevant content.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "We use the information we collect for purposes such as:\n\n- Providing and improving our services.\n- Responding to your inquiries or requests.\n- Sending updates, newsletters, or marketing communications (you can opt out anytime).\n- Analyzing website usage to improve performance.\n- Meeting legal or regulatory requirements.",
    ],
  },
  {
    title: "3. Sharing Your Information",
    content: [
      "We do not sell, rent, or trade your personal information. We may share your data with:\n\n- Service providers or partners who assist in operating our business (under confidentiality agreements).\n- Legal authorities if required by law or to protect our rights and safety.",
    ],
  },
  {
    title: "4. Data Security",
    content: [
      "We take reasonable technical and organizational measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no internet transmission is 100% secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      "Depending on your location, you may have rights to:\n\n- Access, update, or delete your personal information.\n- Object to or restrict certain data processing.\n- Withdraw consent (where consent is the basis for processing).\n\nTo exercise these rights, contact us at probizmanagementservices@gmail.com.",
    ],
  },
  {
    title: "6. Cookies",
    content: [
      "We use cookies to improve your browsing experience. You can control or disable cookies through your browser settings, but doing so may affect website functionality.",
    ],
  },
  {
    title: "7. Third-Party Links",
    content: [
      "Our website may include links to third-party sites. We are not responsible for their privacy practices, so we encourage you to read their policies before providing personal data.",
    ],
  },
  {
    title: "8. Data Retention",
    content: [
      "We retain your personal data only as long as necessary for the purposes stated in this policy, or as required by law.",
    ],
  },
  {
    title: "9. International Transfers",
    content: [
      "If you are accessing our site from outside [Your Country], your information may be transferred to and processed in [Your Country], where data protection laws may differ from your jurisdiction.",
    ],
  },
  {
    title: "10. Updates to This Policy",
    content: [
      "We may update this Privacy Policy periodically. We will post the updated version on this page, and significant changes will be communicated via email or website notice.",
    ],
  },
];

export default PrivacyPolicy;
