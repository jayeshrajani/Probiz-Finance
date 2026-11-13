import React from "react";

import Banner from "../components/home/banner";
import CustomerExperience from "../components/home/customerexperience";
import TrendingCards from "../components/home/trendingcards";
import Heading from "../components/home/heading";
import CreditCard from "../components/home/creditcard";
import Services from "../components/home/services";
import FinancialCalculator from "../components/home/financialcalculator";
import HowItWorks from "../components/home/howitworks";
import Blogs from "../components/home/blogs";
import Testimonial from "../components/home/testimonial";
import NewsLetter from "../components/home/newsletter"; 
import Footer from "../components/common-component/Footer";
import Header from "../components/common-component/Header";
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>
          Probiz Finance – Business & Asset Loan Experts in Indore
        </title>
        <meta
          name="title"
          content=" Probiz Finance – Business & Asset Loan Experts in Indore"
        />
        <meta
          name="description"
          content="Get fast & flexible business, asset & working capital loans in Indore. Trusted finance experts for SMEs, invoice finance, trade funding & more."
        />
        <meta
          name="keywords"
          content="business loans in Indore,
Asset Finance Indore,
Working Capital Loans Indore,
SME loans in Indore,
Car loan in Indore,
Mortgage loan in Indore,
Finance solutions for startups,
Unsecured business loans,
Commercial loans in Indore,
Gold loan in Indore
"
        />


      </Head>
      <Header />
      <Banner />
      <CustomerExperience />
      <TrendingCards />
      {/* <Developers /> */}
      <Heading />
      <CreditCard />
      <Services />
      <FinancialCalculator />
      <HowItWorks />
      {/* <Properties /> */}
      <Blogs />
      <Testimonial />
      <NewsLetter />
      <Footer />
      
    </>
  );
}
