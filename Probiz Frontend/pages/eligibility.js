import React from "react";
import Header from "../components/common-component/Header";
import Footer from "../components/common-component/Footer";
import PersonalBanner from "../components/eligibility/personalbanner";
import Potential from "../components/eligibility/potential";
import LoanOffers from "../components/eligibility/loanoffers";
import EmiLoan from "../components/eligibility/emiloan";
import Cities from "../components/eligibility/cities";
import NewsLetter from "../components/home/newsletter";



export default function Eligibility() {
  return (
    <>
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
