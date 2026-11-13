import React from 'react'
import PersonalBanner from '../components/sipLoan/personalbanner'
import Potential from '../components/sipLoan/potential'
import LoanOffers from '../components/sipLoan/loanoffers'
import EmiLoan from '../components/sipLoan/emiloan'
import Cities from '../components/sipLoan/cities'
import NewsLetter from '../components/home/newsletter'
import Header from '../components/common-component/Header'
import Footer from '../components/common-component/Footer'

export default function SipCalculator() {
  return (
    <div>
       <Header/>
           <PersonalBanner />
           <Potential />
           <LoanOffers />
           <EmiLoan />
           <Cities />
           <NewsLetter />
           <Footer />
    </div>
  )
}
