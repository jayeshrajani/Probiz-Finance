import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/mortrageloan/personalbanner'
import Potential from '../components/mortrageloan/potential'
import LoanOffers from '../components/mortrageloan/loanoffers'
import EmiLoan from '../components/mortrageloan/emiloan'
import Cities from '../components/mortrageloan/cities'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import Head from 'next/head'

export default function MortrageLoan() {
  return (
    <>
     <Head>
        <title>
          Probiz Finance | Mortgage Loans in Indore – Competitive & Quick
        </title>
        <meta
          name="title"
          content="Probiz Finance | Mortgage Loans in Indore – Competitive & Quick"
        />
        <meta
          name="description"
          content="Secure flexible mortgage loans in Indore with low interest rates & easy eligibility. Fast approvals, minimal paperwork—apply now through Probiz Finance!"
        />
        <meta
          name="keywords"
          content="mortgage loan Indore,
home mortgage loan Indore,
mortgage finance Indore,
mortgage loan eligibility Indore,
mortgage loan interest rates Indore,
mortgage refinance Indore,
mortgage balance transfer Indore,
mortgage loan for self-employed Indore,
mortgage loan for salaried Indore,
mortgage EMI calculator Indore,
apply mortgage loan online Indore,
best mortgage loan Indore,
mortgage broker Indore,
low down payment mortgage Indore,
NRI mortgage loan Indore,
quick mortgage loan approval,
mortgage documentation Indore,
mortgage loan consultants Indore,
mortgage top-up loan Indore
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
