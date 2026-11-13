import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/plotpurchaseconstruction/personalbanner'
import Potential from '../components/plotpurchaseconstruction/potential'
import LoanOffers from '../components/plotpurchaseconstruction/loanoffers'
import EmiLoan from '../components/plotpurchaseconstruction/emiloan'
import Cities from '../components/plotpurchaseloan/cities'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'
import Head from 'next/head'

export default function PlotPurchaseConstruction() {
  return (
    <>
    <Head>
        <title>
          Probiz Finance | Plot & Construction Loans in Indore – Build Easily
        </title>
        <meta
          name="title"
          content="Probiz Finance | Plot & Construction Loans in Indore – Build Easily"
        />
        <meta
          name="description"
          content="Secure plot + construction loan in Indore. Flexible funding for purchase & build – minimal paperwork, competitive rates, fast approval. Apply now!"
        />
        <meta
          name="keywords"
          content="plot and construction loan Indore,
plot + construction loan Indore,
Plot purchase and construction loan in Indore,
plot purchase with construction finance in Indore,
land & construction loan Indore,
plot construction finance Indore,
plot and build home loan Indore,
plot purchase construction loan Indore,
plot taken for construction loan in Indore,
construction loan on plot in Indore,
land purchase + construction loan Indore,
plot and build loan eligibility,
plot and construction loan interest rates,
plot construction loan EMI calculator,
Self-employed plot construction loan,
NRI plot and construction loan,
quick approval plot & construction loan,
plot construction loan documentation Indore,
best plot + construction loan Indore
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
