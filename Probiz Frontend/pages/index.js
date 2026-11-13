/** @format */

import Head from "next/head";
import HomePage from "./home";

export default function Home() {
  return (
    <>
      <Head>
         <title>
          Probiz Finance – Business & Asset Loan Experts in Indore
        </title>
        <meta
          name="title"
          content=" Probiz Finance – Business & Asset Loan Experts in Indore"
        />
        <meta
          name="description"
          content="Get fast & flexible business, asset & working capital loans in Indore. Trusted finance experts for SMEs, invoice finance, trade funding & more."
        />
        <meta
          name="keywords"
          content="business loans in Indore,
Asset Finance Indore,
Working Capital Loans Indore,
SME loans in Indore,
Car loan in Indore,
Mortgage loan in Indore,
Finance solutions for startups,
Unsecured business loans,
Commercial loans in Indore,
Gold loan in Indore
"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Metrophobic&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <HomePage />
    </>
  );
}
