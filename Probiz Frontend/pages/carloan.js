import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/carloan/personalbanner'
import Potential from '../components/carloan/potential'
import LoanOffers from '../components/carloan/loanoffers'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import EmiLoan from '../components/carloan/emiloan'
import Cities from '../components/carloan/cities'
import Head from 'next/head'

export default function CarLoan() {
  return (
    <>
    <Head>
        <title>
            Probiz Finance | Car Loans in Indore – Low‑Rate & Fast
        </title>
        <meta
          name="title"
          content="Probiz Finance | Car Loans in Indore – Low‑Rate & Fast"
        />
        <meta
          name="description"
          content="Get fast car loans in Indore., flexible tenures, 100% funding, and instant approvals. Apply now with Probiz Finance!"
        />
        <meta
          name="keywords"
          content="car loan Indore,
car loan interest rate Indore,
low interest car loan Indore,
new car loan Indore,
used car loan Indore,
instant car loan Indore,
car loan eligibility Indore,
car loan EMI calculator Indore,
100% funding car loan Indore,
EV car loan Indore,
flexible tenure car loan Indore,
car loan documentation Indore,
self‑employed car loan Indore,
salaried car loan Indore,
pre‑owned car loan Indore,
quick car loan approval Indore,
best car loan offers Indore,
car loan top‑up Indore,
car loan refinance Indore,
low down payment car loan Indore
"
        />


      </Head>
      <Header/>
      <PersonalBanner/>
      <Potential/>
      <LoanOffers/>
      <EmiLoan/>
      {/* <Cities/> */}
      <NewsLetter/>
      <Footer/>
    </>
  )
}
