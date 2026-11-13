import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/buisnessloan/personalbanner'
import Potential from '../components/buisnessloan/potential'
import LoanOffers from '../components/buisnessloan/loanoffers'
import EmiLoan from '../components/buisnessloan/emiloan'
import Cities from '../components/buisnessloan/cities'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import Head from 'next/head'

export default function BuisnessLoan() {
  return (
    <>
    <Head>
        <title>
            Probiz Finance | Business Loans in Indore – Tailored for Growth
        </title>
        <meta
          name="title"
          content="Probiz Finance | Business Loans in Indore – Tailored for Growth"
        />
        <meta
          name="description"
          content="Get flexible business loans in Indore—low interest, quick approvals, minimal documentation. Ideal for SMEs, startups, and expansion. Apply now with Probiz Finance!"
        />
        <meta
          name="keywords"
          content="business loan Indore,
small business loan Indore,
SME loan Indore,
startup business loan Indore,
low interest business loan Indore,
unsecured business loan Indore,
working capital loan Indore,
commercial loan Indore,
business expansion loan Indore,
business loan eligibility Indore,
business loan EMI calculator Indore,
business loan documentation Indore,
quick business loan approval Indore,
best business loan Indore,
business loan for self-employed Indore,
business loan for women entrepreneurs Indore,
business loan refinancing Indore,
business loan balance transfer Indore,
business loan consultant Indore,
business loan offers Indore
"
        />


      </Head>
      <Header/>
      <PersonalBanner/>
      <Potential/>
      <LoanOffers/>
      <EmiLoan/>
      <Cities/>
      <NewsLetter/>
      <Footer/>
    </>
  )
}
