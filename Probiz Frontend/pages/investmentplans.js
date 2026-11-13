import React from 'react'
import HeaderSec from '../components/common-component/HeaderSec'
import Footer from '../components/common-component/Footer'
import InvestmentBanner from '../components/investmentplan/banner'
import InvestmentForm from '../components/investmentplan/healthForm'

export default function InvestmentPlans() {
    return (
        <div>
            <HeaderSec />
            <InvestmentBanner />
            <InvestmentForm />
            <Footer />
        </div>
    )
}
