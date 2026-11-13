import React from "react";
import Header from "../components/common-component/Header";
import PersonalBanner from "../components/balancetransfer/personalbanner";
import Potential from "../components/balancetransfer/potential";
import LoanOffers from "../components/balancetransfer/loanoffers";
import EmiLoan from "../components/balancetransfer/emiloan";
import Cities from "../components/balancetransfer/cities";
import NewsLetter from "../components/home/newsletter";
import Footer from "../components/common-component/Footer";
import Head from "next/head";
// import HeaderSec from "../components/common-component/HeaderSec";

export default function BalanceTransfer() {
  return (
    <>
     <Head>
        <title>
           Probiz Finance | Balance Transfer Loans in Indore – Save Now
        </title>
        <meta
          name="title"
          content="Probiz Finance | Balance Transfer Loans in Indore – Save Now"
        />
        <meta
          name="description"
          content="Slash your EMI with balance transfer loans in Indore. Lower interest, flexible tenure, minimal paperwork, fast approval. Apply now to reduce your payments!"
        />
        <meta
          name="keywords"
          content="balance transfer loan Indore,
balance transfer home loan Indore,
home loan balance transfer Indore,
loan balance transfer Indore,
mortgage balance transfer Indore,
low interest balance transfer loan Indore,
balance transfer EMI calculator Indore,
balance transfer eligibility Indore,
balance transfer loan Indore,
best balance transfer rates Indore,
balance transfer loan documentation Indore,
quick balance transfer approval Indore,
balance transfer loan tenure Indore,
self-employed balance transfer loan,
NRI balance transfer loan Indore,
balance transfer refinance Indore,
balance transfer loan consultancy,
reduce EMI balance transfer Indore,
refinance home loan balance transfer,
balance transfer loan for salaried
"
        />


      </Head>
      <Header/>
      <PersonalBanner />
      <Potential />
      <LoanOffers/>
      <EmiLoan/>
      <Cities/>
      <NewsLetter/>
      <Footer/>
     
    </>
  );
}
