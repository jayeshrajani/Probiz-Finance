import React from "react";
import Header from "../components/common-component/Header";
import PersonalBanner from "../components/personlloan/personalbanner";
import Potential from "../components/personlloan/potential";
import LoanOffers from "../components/personlloan/loanoffers";
import EmiLoan from "../components/personlloan/emiloan";
import Cities from "../components/personlloan/cities";
import NewsLetter from "../components/home/newsletter";
import Footer from "../components/common-component/Footer";
import Head from "next/head";

export default function PersonalLoan() {
  return (
    <>
     <Head>
        <title>
            Probiz Finance | Personal Loans in Indore – Fast, Low-Rate
        </title>
        <meta
          name="title"
          content="Probiz Finance | Personal Loans in Indore – Fast, Low-Rate"
        />
        <meta
          name="description"
          content="Get quick personal loans in Indore with interest from ~10.8–16.5% p.a. Low documentation, flexible tenure, instant approval. Apply today with Probiz Finance!"
        />
        <meta
          name="keywords"
          content="personal loan Indore,
instant personal loan Indore,
personal loan interest rate Indore,
personal loan eligibility Indore,
unsecured personal loan Indore,
personal loan EMI calculator Indore,
low interest personal loan Indore,
personal loan for salaried Indore,
personal loan for self-employed Indore,
personal loan without collateral Indore,
personal loan online Indore,
quick approval personal loan Indore,
personal loan documentation Indore,
personal loan balance transfer Indore,
NRI personal loan Indore,
best personal loan offers Indore,
part prepayment personal loan Indore,
personal loan processing fee Indore,
reduce EMI personal loan Indore
"
        />


      </Head>
      <Header />
      <PersonalBanner />
      <Potential/>
      <LoanOffers/>
      <EmiLoan/>
      <Cities/>
      <NewsLetter/>
      <Footer/>
    </>
  );
}
