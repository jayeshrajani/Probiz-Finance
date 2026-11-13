import React from 'react'
import Header from '../components/common-component/Header'
import Footer from '../components/common-component/Footer'
import { Container } from 'react-bootstrap'
import HeaderSec from '../components/common-component/HeaderSec'

export default function About() {
    return (
        <>
            <HeaderSec />
            <Container>
                <h3 style={{ paddingTop: "70px", paddingBottom: "20px", fontSize: "30px", textAlign: "center" }}><strong> About Us</strong></h3>
                <h4 style={{ marginBottom: "20px", fontSize: "18px" }}>
                    ProBiz Finance (ProBiz Management Services Pvt. Ltd.)
                    Founded in 2013, ProBiz Finance (ProBiz Management Services Pvt. Ltd.) began its journey with a focus on secured loans and financial consultation, steadily building a reputation for trust, transparency, and client-centric service. Over the years, we have guided countless individuals and businesses through their financial decisions, establishing ourselves as a reliable and respected partner in the finance industry.</h4>
                <h5 style={{ marginBottom: "20px", fontSize: "18px" }}> The company experienced a significant milestone in 2021, when Mr. Shubham Gehlot joined as Co-Founder and Director. Bringing over 10 years of corporate expertise across corporate sales, consulting, real estate, and finance, along with a Master's degree from Pune University, his leadership has been instrumental in shaping ProBiz Finance (ProBiz Management Services Pvt. Ltd.)'s strategic direction and expansion. Under his guidance, the company broadened its offerings to include unsecured loans, car loans, credit cards, real estate services, legal assistance, project funding, and investment planning, creating a comprehensive financial solutions ecosystem for every client.</h5>

                <h5 style={{ marginBottom: "30px", fontSize: "18px" }}>ProBiz Finance (ProBiz Management Services Pvt. Ltd.) has also established a strong presence across all major social media platforms, engaging with clients, sharing financial insights, and enhancing accessibility to its services. Recognized as one of the most trusted and loved fintech DSA companies in Central India, the brand has continually earned the confidence of its clients through professionalism, integrity, and consistent performance. To further simplify financial access, the company launched its dedicated platform at
                    <a href='/https://probizfinance.com/' style={{ color: "blue" }}>  probizfinance.com</a>
                    , offering a one-stop solution for all financial requirements, including loans, investment planning, real estate support, and legal guidance.</h5>

                <h5 style={{ marginBottom: "30px", fontSize: "18px" }}>

                    Driven by a mission to deliver transparent, reliable, and client-focused financial solutions, ProBiz Finance (ProBiz Management Services Pvt. Ltd.) is committed to empowering individuals and businesses through wealth creation and financial literacy. With a foundation built on integrity, innovation, and customer-first principles, the company continuously evolves its services to make financial processes simpler, faster, and more effective.

                    From its inception to its present position as a full-spectrum financial solutions provider, ProBiz Finance (ProBiz Management Services Pvt. Ltd.) remains dedicated to expert advisory, innovation, and unwavering commitment to client success, ensuring every client experiences a seamless, informed, and empowering financial journey.
                </h5>


            </Container>

            <Footer />
        </>
    )
}
