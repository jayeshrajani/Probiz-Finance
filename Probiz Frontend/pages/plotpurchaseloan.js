import React from "react";
import Header from "../components/common-component/Header";
import PersonalBanner from "../components/plotpurchaseloan/personalbanner";
import Potential from "../components/plotpurchaseloan/potential";
import LoanOffers from "../components/plotpurchaseloan/loanoffers";
import EmiLoan from "../components/plotpurchaseloan/emiloan";
import Cities from "../components/plotpurchaseloan/cities";
import NewsLetter from "../components/home/newsletter";
import Footer from "../components/common-component/Footer";
import HeaderSec from "../components/common-component/HeaderSec";
import Head from "next/head";

export default function PlotPurchaseLoan() {
  return (
    <div>
      <Head>
        <title>
          Probiz Finance | Plot Purchase Loans in Indore – Fast & Flexible
        </title>
        <meta
          name="title"
          content="Probiz Finance | Plot Purchase Loans in Indore – Fast & Flexible"
        />
        <meta
          name="description"
          content="Buy land in Indore with ease! Competitive plot purchase loans, flexible tenures, minimal documentation, quick approvals. Apply now with Probiz Finance."
        />
        <meta
          name="keywords"
          content="plot purchase loan Indore,
land loan Indore,
plot financing in Indore,
land purchase loan Indore,
best plot loan in Indore,
plot loan eligibility,
plot loan interest rates in Indore,
plot loan EMI calculator,
Rural plot loan Indore,
Agricultural land loan in Indore,
plot loan broker Indore,
Plot loan consultant Indore,
Plot purchase finance Indore,
Quick plot loan approval,
Self-employed plot loan Indore,
NRIs plot purchase loan in Indore,
plot loan documentation
"
        />


      </Head>
      <HeaderSec />
      <br/>
      <PersonalBanner />
      <Potential />
      <LoanOffers />
      <EmiLoan/>
      <Cities/>
      <NewsLetter/>
      <Footer/>
    </div>
  );
}
