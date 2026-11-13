import React from "react";
import PersonalBanner from "../components/homeloan/personalbanner";
import Potential from "../components/homeloan/potential";
import LoanOffers from "../components/homeloan/loanoffers";
import EmiLoan from "../components/homeloan/emiloan";
import Cities from "../components/homeloan/cities";
import NewsLetter from "../components/home/newsletter";
import Footer from "../components/common-component/Footer";
import Header from "../components/common-component/Header";
import Head from "next/head";

export default function HomeLoan() {
  return (
    <>
    <Head>
        <title>
          Probiz Finance |  Home Loans in Indore | Quick Approvals
        </title>
        <meta
          name="title"
          content="Probiz Finance |  Home Loans in Indore | Quick Approvals"
        />
        <meta
          name="description"
          content=" Get personalized home loan solutions in Indore. Low interest, easy eligibility, flexible tenure. Expert guidance & fast approvals—apply now with Probiz Finance!"
        />
        <meta
          name="keywords"
          content="home loan Indore,
Home loan in Indore,
Best home loan in Indore,
Low-interest home loan in Indore,
Home Loan Broker Indore,
Home Loan Eligibility Indore,
Home loan interest rates in Indore,
Home Loan Application Indore,
Home loan EMI calculator Indore,
Home Loan Consultant Indore,
Home Financing Indore,
Affordable Home Loan Indore,
Home loan for women in Indore,
Home loan top-up Indore,
Home Loan Refinance Indore,
Home Loan Balance Transfer Indore,
Quick home loan approval in Indore,
Salaried home loan Indore,
Self-Employed Home Loan Indore,
Home Loan Documentation Indore
"
        />


      </Head>
      <Header />
    
      <PersonalBanner />
      <Potential />
      <LoanOffers />
      <EmiLoan />
      <Cities />
      <NewsLetter />
      <Footer />
    </>
  );
}
