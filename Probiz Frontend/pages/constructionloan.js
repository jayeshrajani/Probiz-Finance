import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/constructionloan/personalbanner'
import Potential from '../components/constructionloan/potential'
import EmiLoan from '../components/constructionloan/emiloan'
import LoanOffers from '../components/constructionloan/loanoffers'
import Cities from '../components/constructionloan/cities'
import Footer from '../components/common-component/Footer'
import Head from 'next/head'

export default function ConstructionLoan() {
  return (
    <>
     <Head>
        <title>
          Probiz Finance | Construction Loans in Indore – Quick & Flexible
        </title>
        <meta
          name="title"
          content="Probiz Finance | Construction Loans in Indore – Quick & Flexible"
        />
        <meta
          name="description"
          content="Get tailored construction loans in Indore with competitive interest, flexible tenure, fast approvals. Expert guidance & minimal documentation. Apply today!"
        />
        <meta
          name="keywords"
          content="construction loan Indore,
home construction loan Indore,
building loan Indore,
construction finance Indore,
construction loan eligibility Indore,
construction loan interest rates Indore,
construction loan EMI calculator Indore,
construction loan for self‑employed Indore,
quick construction loan approval Indore,
construction loan consultant Indore,
best construction loan Indore,
construction project funding Indore,
construction loan documentation Indore,
lump sum construction loan Indore,
stage‑wise construction loan Indore,
construction loan for salaried Indore,
NRI construction loan Indore,
construction loan top‑up Indore,
loan for house construction Indore,
low down payment construction loan
"
        />


      </Head>
      <Header/>
      <PersonalBanner/>
      <Potential/>
   
      <LoanOffers/>
         <EmiLoan/>
      <Cities/>
      <Footer/>
    </>
  )
}
