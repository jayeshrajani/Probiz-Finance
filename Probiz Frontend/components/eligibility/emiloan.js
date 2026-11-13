import React, { useState } from "react";
import { Slider, Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { PostRequest } from "../api-handler";
ChartJS.register(ArcElement, Tooltip, Legend);
export default function EmiLoan() {
  const [loanAmount, setLoanAmount] = useState();
  const [loanTenure, setLoanTenure] = useState();
  const [interestRate, setInterestRate] = useState();
   const [alldata, setAlldata] = useState([]);
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

const getLoan = async()=>{
  let data = {
    grossIncome:loanAmount,
    interestRate:interestRate,
    tenure:loanTenure
  }
  
      let res = await PostRequest("eligibilityCalculator",data);
       if(res){
        // console.log("res ==>",res);
        setAlldata(res);
       }   
}

  return (
    <>
      <section className="bg-[#FFF1E4] py-12">
        <h1 className="text-center text-4xl font-[700]">
          Calculate Your Eligibility Loan Online
        </h1>
        <p
          className="text-[#716D6D] text-center font-[500] text-base mt-3;
"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam, dapibus
          mattis vel feugiat erat tortor eleifend.
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
              <Typography variant="h6">Gross Income (Monthly)</Typography>
              <Slider
                value={loanAmount}
                min={5000}
                max={10000000}
                step={500}
                onChange={(e, val) => setLoanAmount(val)}
                valueLabelDisplay="auto"
              />
              {/* <Typography>₹ {loanAmount.toLocaleString()}</Typography> */}

              <Typography variant="h6" style={{ marginTop: "20px" }}>
                Loan Tenure
              </Typography>
              <Slider
                value={loanTenure}
                min={1}
                max={30}
                step={1}
                onChange={(e, val) => setLoanTenure(val)}
                valueLabelDisplay="auto"
              />
              <Typography>{loanTenure} Years</Typography>

              <Typography variant="h6" style={{ marginTop: "20px" }}>
                Rate of Interest
              </Typography>
              <Slider
                value={interestRate}
                min={8}
                max={25}
                step={0.1}
                onChange={(e, val) => setInterestRate(val)}
                valueLabelDisplay="auto"
              />
              <Typography>{interestRate}%</Typography>
            </div>
            <div className="cols col-span-3 text-center bg-[#D3D3D3] rounded-xl flex items-center justify-center">
              <div>
                <Typography variant="h6" className="text-[#676767]">Loan Status</Typography>
                <Typography variant="h4" className="mt-5">
                  {/* ₹ {monthlyEMI.toLocaleString()} */}
                </Typography>
                <Typography className="mt-5 text-[#676767]">
                {alldata.message?alldata.message:""}
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
                 
                  <div className="flex justify-evenly mt-3">
                    <Typography>Loan Eligibility:</Typography>
                    <Typography>
                      ₹ {alldata.maxLoanAmount?alldata.maxLoanAmount:"00.00"}
                    </Typography>
                  </div>
                  <div className="flex justify-evenly mt-3">
                    <Typography>Loan EMI:</Typography>
                    <Typography>
                      ₹ {alldata.maxEligibleEMI?alldata.maxEligibleEMI:"00.00"}
                    </Typography>
                  </div>
                  <div className="text-center mt-5">
                    <button onClick={getLoan} className="bg-[#4C1F7A] text-white py-2 px-4 rounded w-8/12">
                      VIEW EMI SCHEDULE
                    </button>
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
