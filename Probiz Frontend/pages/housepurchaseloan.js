import React from 'react'
import Header from '../components/common-component/Header'
import PersonalBanner from '../components/housepurchaseloan/personalbanner'
import LoanOffers from '../components/housepurchaseloan/loanoffers'
import Potential from '../components/housepurchaseloan/potential'
import EmiLoan from '../components/housepurchaseloan/emiloan'
import { Circle } from '@mui/icons-material'
import Cities from '../components/housepurchaseloan/cities'
import NewsLetter from '../components/home/newsletter'
import Footer from '../components/common-component/Footer'

export default function HousePurchaseLoan() {
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
      {/* <h1>House Purchase Loan</h1> */}
    </>
  )
}
