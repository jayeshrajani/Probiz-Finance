import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/creditcard/personalbanner'
import Potential from '../components/creditcard/potential'
import LoanOffers from '../components/creditcard/loanoffers'
import EmiLoan from '../components/creditcard/emiloan'
import Cities from '../components/creditcard/cities'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import Head from 'next/head'

export default function CreditCard() {
  return (
    <>
     <Head>
        <title>
            Probiz Finance | Credit Card Loans in Indore – Fast & Flexible
        </title>
        <meta
          name="title"
          content="Probiz Finance | Credit Card Loans in Indore – Fast & Flexible"
        />
        <meta
          name="description"
          content="Convert your credit card limit into a loan in Indore—low-interest, flexible tenures up to 60 months, minimal documentation & fast disbursal. Apply now!"
        />
        <meta
          name="keywords"
          content="loan on credit card Indore,
credit card loan Indore,
convert credit limit to loan Indore,
credit card personal loan Indore,
pre‑approved credit card loan Indore,
credit card EMI loan Indore,
flexible tenure credit card loan,
low interest credit card loan Indore,
loan against credit card Indore,
instant credit card loan Indore,
unsecured credit card loan,
credit card loan eligibility Indore,
credit card loan documentation,
EMI calculator credit card loan,
fast credit card loan approval,
balance transfer vs credit card loan,
credit card loan interest rate,
credit card loan for self‑employed,
credit card loan for salaried,
credit card loan processing fee Indore
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
