import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/kisancreditcard/personalbanner'
import Potential from '../components/kisancreditcard/potential'
import EmiLoan from '../components/kisancreditcard/emiloan'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import LoanOffers from '../components/kisancreditcard/loanoffers'
import Head from 'next/head'

export default function KisanCreditCard() {
  return (
    <>
    <Head>
        <title>
            Probiz Finance | Kisan Credit Card in Indore – Low-Interest Agri Loans
        </title>
        <meta
          name="title"
          content="Probiz Finance | Kisan Credit Card in Indore – Low-Interest Agri Loans"
        />
        <meta
          name="description"
          content="Get Kisan Credit Card loans in Indore—up to ₹5 Lakh,, minimal paperwork & fast approvals under government schemes. Apply now!"
        />
        <meta
          name="keywords"
          content="Kisan Credit Card Indore,
KCC loan Indore,
Kisan Credit Card interest rate,
KCC eligibility Indore,
KCC online application Indore,
government farm loan Indore,
KCC subsidy scheme Indore,
agri loan Kisan Credit Card,
KCC documentation Indore,
KCC disbursal Indore,
crop loan Indore,
KCC for animal husbandry,
fisheries Kisan Credit Card,
low-interest agri loan Indore,
KCC RBI repo influence
"
        />


      </Head>
      {/* <h1>Kisan Credit Card</h1> */}
      <Header/>
      <PersonalBanner/>
      <Potential/>
      <LoanOffers/>
      <EmiLoan/>
      <NewsLetter/>
      <Footer/>
    </>
  )
}
