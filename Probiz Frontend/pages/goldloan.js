import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/goldloan/personalbanner'
import Potential from '../components/goldloan/potential'
import LoanOffers from '../components/goldloan/loanoffers'
import EmiLoan from '../components/goldloan/emiloan'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'

export default function GoldLoan() {
  return (
    <>
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
