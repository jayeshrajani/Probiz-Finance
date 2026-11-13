import React from 'react'
import Healthbanner from '../components/healthInsurance/banner'
import HealthInsuranceForm from '../components/healthInsurance/healthForm'
import HeaderSec from '../components/common-component/HeaderSec'
import Footer from '../components/common-component/Footer'

export default function HealthInsurance() {
    return (
        <div>
            <HeaderSec />
            <Healthbanner />
            <HealthInsuranceForm />
            <Footer />
        </div>
    )
}
