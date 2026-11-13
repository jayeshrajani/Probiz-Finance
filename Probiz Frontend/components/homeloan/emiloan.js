import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PostRequest } from "../api-handler";
ChartJS.register(ArcElement, Tooltip, Legend);
export default function EmiLoan() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanTenure, setLoanTenure] = useState(20);
  const [interestRate, setInterestRate] = useState(5);
  const [alldata, setAlldata] = useState([]);
  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  const clampNumber = (value, min, max) =>
    Math.min(max, Math.max(min, Number(value) || min));

  useEffect(() => {
  if (loanAmount && loanTenure && interestRate) {
    getLoan();
  }
}, [loanAmount, loanTenure, interestRate]);
  const calculateEMI = (principal, years, rate) => {
    const monthlyRate = rate / (12 * 100);
    const months = years * 12;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI(loanAmount, loanTenure, interestRate);

  const principalAmount = loanAmount;
  const totalPayment = monthlyEMI * loanTenure * 12;
  const interestPayable = totalPayment - principalAmount;

  const data = {
    labels: ["Principal Amount", "Interest Payable"],
    datasets: [
      {
        data: [principalAmount, interestPayable],
        backgroundColor: ["#FF7F00", " #219B9E"],
      },
    ],
  };
  const options = {
    circumference: 180, // Show half the circle
    rotation: -90, // Start from the top
    cutout: "50%", // Makes it a doughnut chart with a hollow center
    plugins: {
      legend: {
        position: "bottom", // Position the legend below the chart
      },
    },
  };

  const getLoan = async () => {
    let data = {
      principal: loanAmount,
      annualInterestRate: interestRate,
      tenureYears: loanTenure,
    };

    let res = await PostRequest("homeLoanCalculator", data);
    if (res) {
      setAlldata(res);
    }
  };

  return (
    <>
      <section className="bg-[#FFF1E4] py-12">
        <h1 className="text-center text-4xl font-[700]">
          Calculate Your Home Loan EMI Online
        </h1>
        <p
          className="text-[#716D6D] text-center font-[500] text-base mt-3;
"
        >
          Start calculating now and make informed financial decisions for your
          dream home!
        </p>
        <div
          className="container  mx-auto rounded-lg"
          style={{
            padding: "20px",
            backgroundColor: "white",
            marginTop: "30px",
          }}
        >
          <div
            className="grid md:grid-cols-12"
            style={{
              //   display: "flex",
              //   justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <div className="cols col-span-5 px-10">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6">Loan Amount</Typography>
                  <Typography className="font-semibold text-[#ff7f00]">
                    ₹ {formatCurrency(loanAmount)}
                  </Typography>
                </div>
                <input
                  type="range"
                  className="mt-3 w-full accent-[#ff7f00]"
                  value={loanAmount}
                  min={50000}
                  max={10000000}
                  step={50000}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="mt-3 w-full rounded border border-gray-300 px-3 py-2"
                  value={loanAmount}
                  min={50000}
                  max={10000000}
                  step={50000}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  onBlur={() =>
                    setLoanAmount(clampNumber(loanAmount, 50000, 10000000))
                  }
                />
                <Typography className="mt-1 text-xs text-gray-500">
                  Min: ₹50,000 | Max: ₹1,00,00,000
                </Typography>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6">Loan Tenure</Typography>
                  <Typography className="font-semibold text-[#ff7f00]">
                    {loanTenure} Years
                  </Typography>
                </div>
                <input
                  type="range"
                  className="mt-3 w-full accent-[#ff7f00]"
                  value={loanTenure}
                  min={1}
                  max={30}
                  step={1}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="mt-3 w-full rounded border border-gray-300 px-3 py-2"
                  value={loanTenure}
                  min={1}
                  max={30}
                  step={1}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  onBlur={() => setLoanTenure(clampNumber(loanTenure, 1, 30))}
                />
                <Typography className="mt-1 text-xs text-gray-500">
                  Min: 1 year | Max: 30 years
                </Typography>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6">Rate of Interest</Typography>
                  <Typography className="font-semibold text-[#ff7f00]">
                    {interestRate}%
                  </Typography>
                </div>
                <input
                  type="range"
                  className="mt-3 w-full accent-[#ff7f00]"
                  value={interestRate}
                  min={5}
                  max={25}
                  step={0.1}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="mt-3 w-full rounded border border-gray-300 px-3 py-2"
                  value={interestRate}
                  min={5}
                  max={25}
                  step={0.1}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  onBlur={() => setInterestRate(clampNumber(interestRate, 5, 25))}
                />
                <Typography className="mt-1 text-xs text-gray-500">
                  Interest starts from 5% p.a.
                </Typography>
              </div>
            </div>
            <div className="cols col-span-3 text-center bg-[#D3D3D3] rounded-xl flex items-center justify-center px-3">
              <div>
                <Typography variant="h6" className="text-[#676767]">
                  Monthly Loan EMI
                </Typography>
                <Typography variant="h4" className="mt-5 font-semibold text-[#2d2d2d]">
                  ₹ {formatCurrency(alldata.emi || monthlyEMI || 0)}
                </Typography>
                <Typography className="mt-2 text-xs text-[#676767]">
                  Per month
                </Typography>
              </div>
            </div>
            <div className="cols col-span-4">
              <div style={{ marginTop: "20px" }}>
                <Typography variant="h6" className="text-center">
                  Payment Breakdown
                </Typography>
                <div
                  style={{ width: "200px", height: "200px", margin: "0 auto" }}
                >
                  <Doughnut data={data} options={options} />
                </div>
                <div style={{ marginTop: "10px" }}>
                  <div className="flex justify-evenly">
                    <Typography>Principal Amount:</Typography>
                    <Typography>
                      ₹ {formatCurrency(alldata.principal || principalAmount)}
                    </Typography>
                  </div>
                  <div className="flex justify-evenly mt-3">
                    <Typography>Interest Payable:</Typography>
                    <Typography>
                      ₹ {formatCurrency(alldata.interestAmount || interestPayable)}
                    </Typography>
                  </div>
                  <div className="flex justify-evenly mt-3">
                    <Typography>Total Amount Payable:</Typography>
                    <Typography>
                      ₹ {formatCurrency(alldata.totalPayable || totalPayment)}
                    </Typography>
                  </div>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
