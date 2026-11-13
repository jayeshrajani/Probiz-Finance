import Head from "next/head";
import Link from "next/link";

export default function FinancialCalculators() {
  const calculators = [
    {
      link:"/homeloan",
      title: "Home Loan EMI Calculator",
      title2: "Plan your dream home with precision",
      description: "Calculate your exact Equated Monthly Installment (EMI) for home loans based on loan amount, interest rate, and tenure.",
      point1: "✅ View amortization schedule ",
      point2: "✅ Compare loan scenarios ",
      point3: "✅ Adjust for prepayments ",
      buttonText: "Get Started →",
      imageUrl: "/images/financialcard1.png",
    },
    {
      link:"/eligibility",
      title: "Loan Eligibility Calculator",
      title2: "Discover how much you can borrow",
      description: "Instantly check your maximum eligible loan amount based on your income, expenses, and credit profile.",
      point1: "✔ Real-time eligibility assessment",
      point2: "✔ Multiple loan product comparisons",
      point3: "✔ Personalized recommendations",
      buttonText: "Check Eligibility →",
      imageUrl: "/images/financialcard2.png",
    },
    {
      link:"/balancetransfer",
      title: "Balance Transfer Calculator",
      title2: "Find better loan deals and save",
      description: "Analyze potential savings when transferring your existing home loan to a new lender with lower interest rates.",
      point1: "▸ Compare interest savings ",
      point2: "▸ Calculate processing fee impact ",
      point3: "▸ Break-even analysis ",
      buttonText: "Calculate Savings →",
      imageUrl: "/images/financialcard3.png",
    },
   
    
    
  ];

  return (
    <div className="container mx-auto py-12 px-6">
      <Head>
        <title>Financial Calculators</title>
      </Head>
      <h1 className="text-3xl font-bold text-center mb-4">
        Financial Calculators
      </h1>
      <h3 className="text-lg  text-center mb-6">
      Smart Tools for Smarter Financial Decisions
      </h3>
      <p className="text-center mb-12 text-gray-600">
      Take control of your financial future with our suite of easy-to-use calculators. Whether you're planning for a home loan, investment, or retirement, <br/>our tools provide accurate projections to help you make informed decisions.
      </p>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
       
      >
        {calculators.map((calculator, index) => (
          <div key={index} className="bg-white  rounded-lg p-6 financial_cards">
            <div className="flex justify-center items-center w-16 h-16  mb-4">
              <img
                className="w-full"
                src={calculator.imageUrl}
                alt="services card"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">{calculator.title}</h2>
            <h2 className="text-md font-semibold mb-2">{calculator.title2}</h2>
            <p className="text-gray-600 mb-4">{calculator.description}</p>
            <p className="text-gray-600 mb-4">{calculator.point1}</p>
            <p className="text-gray-600 mb-4">{calculator.point2}</p>
            <p className="text-gray-600 mb-4">{calculator.point3}</p>
           
            <div className="mt-4">
              <Link href={calculator.link}>
              <button className="bg-[#4C1F7A] text-white py-2 px-4 rounded">
                {calculator.buttonText}
              </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
