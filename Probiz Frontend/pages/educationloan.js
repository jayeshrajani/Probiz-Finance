import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/educationloan/personalbanner'
import LoanOffers from '../components/educationloan/loanoffers'
import EmiLoan from '../components/educationloan/emiloan'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import Potential from '../components/educationloan/potential'
import Head from 'next/head'

export default function EducationLoan() {
  return (
    <div>
      <Head>
        <title>
            Probiz Finance | Education Loans in Indore – Affordable & Fast
        </title>
        <meta
          name="title"
          content="Probiz Finance | Education Loans in Indore – Affordable & Fast"
        />
        <meta
          name="description"
          content="Get education loans in Indore. flexible tenure, collateral‑free options for premier institutes, and fast approvals. Apply today!"
        />
        <meta
          name="keywords"
          content=" education loan Indore,
student loan Indore,
education loan interest rate Indore,
premier institute loan Indore,
study abroad loan Indore,
education loan eligibility Indore,
education loan EMI calculator Indore,
government education loan Indore,
PM Vidyalaxmi loan Indore,
education loan documentation Indore,
flexible tenure education loan,
fast approval student loan Indore,
unsecured education loan Indore,
education loan for self-employed,
education loan for salaried,
talk to education loan consultant Indore,
education loan without guarantor
"
        />


      </Head>
      <Header/>
      <PersonalBanner/>
      <Potential/>
      <LoanOffers/>
      <EmiLoan/>
      <NewsLetter/>
      <Footer/>
    </div>
  )
}
