import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/usedcarpurchase/personalbanner'
import Potential from '../components/usedcarpurchase/potential'
import LoanOffers from '../components/usedcarpurchase/loanoffers'
import EmiLoan from '../components/usedcarpurchase/emiloan'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'

export default function UsedCarPurchase() {
  return (
    <div>
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
