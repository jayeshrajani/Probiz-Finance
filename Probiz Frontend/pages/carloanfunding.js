import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/carloanfunding/personalbanner'
import Potential from '../components/carloanfunding/potential'
import LoanOffers from '../components/carloanfunding/loanoffers'
import EmiLoan from '../components/carloanfunding/emiloan'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'

export default function Carloanfunding() {
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
