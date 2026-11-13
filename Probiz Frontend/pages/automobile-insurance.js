import React from 'react'
import HeaderSec from '../components/common-component/HeaderSec'
import Footer from '../components/common-component/Footer'
import AutoMobilebanner from '../components/automobileInsurance/banner'
import AutoMobileInsuranceForm from '../components/automobileInsurance/healthForm'

export default function HealthInsurance() {
    return (
        <div>
            <HeaderSec />
            <AutoMobilebanner />
            <AutoMobileInsuranceForm />
            <Footer />
        </div>
    )
}
