import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/balancetranfertopuploan/personalbanner'
import Potential from '../components/balancetranfertopuploan/potential'
import LoanOffers from '../components/balancetranfertopuploan/loanoffers'
import EmiLoan from '../components/balancetranfertopuploan/emiloan'
import Cities from '../components/balancetranfertopuploan/cities'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'

export default function BalanceTransfertopup() {
  return (
    <>
        <Header/>
        <PersonalBanner/>
        <Potential/>
        <LoanOffers/>
        <EmiLoan/>
        <Cities/>
        <NewsLetter/>
        <Footer/>
      {/* <h1>Balance transfer top up loan</h1> */}
    </>
  )
}
