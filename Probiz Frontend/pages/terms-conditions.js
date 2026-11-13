import React from 'react';
import HeaderSec from '../components/common-component/HeaderSec';
import Footer from '../components/common-component/Footer';

const TermsAndConditions = () => {
  return (
    <>
    <HeaderSec/>
    <div className="max-w-6xl mx-auto px-4 py-20 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="mb-4">Effective Date: 28/05/2025</p>

      <p className="mb-6">
        Welcome to ProBiz Management Services! By accessing or using our website
        (<a href="https://probizfinance.com" className="text-blue-600 underline">https://probizfinance.com</a>) and our services, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.
      </p>

      {sections.map((section, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
          {section.content.map((para, i) => (
            <p key={i} className="mb-2">{para}</p>
          ))}
        </div>
      ))}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
        <p>If you have any questions or concerns about these Terms and Conditions, please contact us at:</p>
        <p className="mt-2 font-medium">ProBiz Management Services</p>
      </div>
    </div>
    <Footer/>   
    </>
  );
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By using our website or engaging our services, you agree to these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use our site or services.",
    ],
  },
  {
    title: "2. Services Provided",
    content: [
      "ProBiz Management Services offers professional consulting, business management, and related services as described on our website. We reserve the right to modify or discontinue services at any time without notice.",
    ],
  },
  {
    title: "3. Use of Website",
    content: [
      "You agree to use the website only for lawful purposes. You must not:",
      "- Use the site in a way that breaches any applicable laws or regulations.",
      "- Attempt to gain unauthorized access to any part of the site or its systems.",
      "- Transmit any viruses, malware, or other harmful material.",
    ],
  },
  {
    title: "4. Intellectual Property",
    content: [
      "All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of ProBiz Management Services or its licensors and is protected by intellectual property laws. You may not copy, reproduce, or distribute any content without our written permission.",
    ],
  },
  {
    title: "5. Limitation of Liability",
    content: [
      "ProBiz Management Services is not liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our services or website. We make no guarantees regarding the accuracy or completeness of any information provided on the site.",
    ],
  },
  {
    title: "6. Payment and Refunds",
    content: [
      "Payment terms for our services will be outlined in individual agreements or proposals. Unless otherwise stated, all fees are non-refundable.",
    ],
  },
  {
    title: "7. Third-Party Links",
    content: [
      "Our website may contain links to third-party websites for your convenience. We are not responsible for the content, privacy practices, or operations of these external sites.",
    ],
  },
  {
    title: "8. Confidentiality",
    content: [
      "Both parties agree to keep confidential any proprietary or sensitive information shared during the course of services, unless disclosure is required by law.",
    ],
  },
  {
    title: "9. Termination",
    content: [
      "We reserve the right to suspend or terminate your access to our services or website at our sole discretion, without prior notice, if we believe you have violated these Terms.",
    ],
  },
  {
    title: "10. Governing Law",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.",
    ],
  },
  {
    title: "11. Changes to Terms",
    content: [
      "We may update these Terms and Conditions from time to time. Any changes will be posted on this page, and continued use of the website signifies your acceptance of the updated terms.",
    ],
  },
];

export default TermsAndConditions;
