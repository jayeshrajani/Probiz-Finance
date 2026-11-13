import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/flatpurchase/personalbanner'
import Potential from '../components/flatpurchase/potential'
import LoanOffers from '../components/flatpurchase/loanoffers'
import EmiLoan from '../components/flatpurchase/emiloan'
import Cities from '../components/flatpurchase/cities'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import Head from 'next/head'

export default function FlatPurchase() {
  return (
    <>
    <Head>
        <title>
          Probiz Finance | Flat Purchase Loans in Indore – Easy & Affordable
        </title>
        <meta
          name="title"
          content="Probiz Finance | Flat Purchase Loans in Indore – Easy & Affordable"
        />
        <meta
          name="description"
          content="Get hassle-free flat purchase loans in Indore. Competitive interest rates, flexible tenure, minimal paperwork, and fast approvals. Apply today!"
        />
        <meta
          name="keywords"
          content="flat purchase loan Indore,
flat loan Indore,
apartment loan Indore,
home loan for flat Indore,
best flat loan Indore,
flat loan interest rates Indore,
flat loan eligibility Indore,
flat loan EMI calculator Indore,
flat loan application Indore,
flat purchase financing Indore,
salaried flat loan Indore,
self‑employed flat loan Indore,
NRI flat loan Indore,
flat loan with low down payment,
quick flat loan approval Indore,
flat purchase loan consultant,
flat loan documentation Indore,
top flat loan providers Indore,
flat purchase finance options,
affordable flat loan Indore
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
