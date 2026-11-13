import React from 'react'
import PersonalBanner from '../components/homerennovation/personalbanner';
import Potential from '../components/homerennovation/potential';
import LoanOffers from '../components/homerennovation/loanoffers';
import EmiLoan from '../components/homerennovation/emiloan';
import Cities from '../components/homerennovation/cities';
import Footer from '../components/common-component/Footer';
import HeaderSec from '../components/common-component/HeaderSec';
import Head from 'next/head';

export default function HomeRennovation() {
  return (
    <div>
      <Head>
        <title>
          Probiz Finance | Home Renovation Loans in Indore – Fast & Flexible
        </title>
        <meta
          name="title"
          content="Probiz Finance | Home Renovation Loans in Indore – Fast & Flexible"
        />
        <meta
          name="description"
          content="Revamp your home in Indore with tailored renovation loans. Up to 90% funding, low interest, tax benefits & fast approvals. Apply now with Probiz Finance!"
        />
        <meta
          name="keywords"
          content=" home renovation loan Indore,
house renovation loan Indore,
home improvement loan Indore,
home repair loan Indore,
home renovation finance Indore,
renovation loan eligibility Indore,
renovation loan interest rate Indore,
unsecured renovation loan Indore,
renovation loan EMI calculator Indore,
top-up home loan for renovation Indore,
tax-saving renovation loan Indore,
home renovation loan documentation,
quick approval renovation loan Indore,
self-employed renovation loan,
salaried renovation loan Indore,
flexible tenure renovation loan,
renovation loan balance transfer Indore,
affordable renovation loan Indore
"
        />


      </Head>
     <HeaderSec />
           <PersonalBanner />
           <Potential />
           <LoanOffers />
           <EmiLoan />
           <Cities />
     <Footer />
    </div>
  )
}
