import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/pradhanmantriloan/personalbanner'
import LoanOffers from '../components/pradhanmantriloan/loanoffers'
import EmiLoan from '../components/pradhanmantriloan/emiloan'
import Cities from '../components/pradhanmantriloan/cities'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import Potential from '../components/pradhanmantriloan/potential'
import Head from 'next/head'

export default function pradhanmantriloan() {
  return (
    <>
    <Head>
        <title>
            Probiz Finance | Pradhan Mantri Loans in Indore – Easy Access
        </title>
        <meta
          name="title"
          content="Probiz Finance | Pradhan Mantri Loans in Indore – Easy Access"
        />
        <meta
          name="description"
          content="Avail Pradhan Mantri loan schemes in Indore. Low interest, subsidised rates, minimal paperwork. Fast approvals."
        />
        <meta
          name="keywords"
          content="Pradhan Mantri loan Indore,
Pradhan Mantri Rozgar Yojana Indore,
PMMY loan Indore,
Pradhan Mantri Mudra loan Indore,
PMEGP loan Indore,
PSB Pradhan Mantri loan Indore,
subsidised loan Indore,
government loan schemes Indore,
PM loan eligibility Indore,
PM loan application Indore,
PM loan interest rate Indore,
personal loans under PMMY Indore,
small business loan PM Indore,
self-employed loan PMMY Indore,
PM loan documentation Indore,
quick approval PM loan Indore,
PM loan for women Indore,
PM loan for startup Indore,
PM loan consultant Indore,
Pradhan Mantri yojana loans Indore
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
