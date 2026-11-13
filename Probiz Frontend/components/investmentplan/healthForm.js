import React, { useState } from "react";
import { PostRequest } from "../api-handler";
import swal from "sweetalert";
import { useRouter } from "next/router";
export default function InvestmentForm() {
     const router = useRouter();
    const [loanType, setLoanType] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        let item = {
            "loan_Type": loanType,
            "first_Name": firstName,
            "last_Name": lastName,
            "email": email,
            "mobile_no": mobileNo,
            "dateOfBirth": dateOfBirth,
        }
        // console.log("item",item);

        const res = await PostRequest("addInvestment", item);
        // console.log("res",res);

        if (res.status === 200) {   
            swal({
               icon: "success",
               text: "Investment Plan Submitted Successfully!",
             }).then(() => {
               // Refresh the page after OK click
               router.reload();
             });
        }
    };

    return (
        <>
            <section className="bg-[#FF7F00] py-10 md:px-12 ">
                <h1 className="text-white text-4xl text-center">
                    Unlock Best Investment Plan Offers
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-12">
                        {/* Left side form */}
                        <div className="cols col-span-6 mt-10 px-5">
                            <div className="mt-5">
                            <select
  value={loanType}
  onChange={(e) => setLoanType(e.target.value)}
  className="py-2 rounded px-5 md:w-8/12 w-full"
  required
>
  <option value="">Select Investment Plan</option>
  <option value="Investment Plans with High Returns">Investment Plans with High Returns</option>
  <option value="Market Linked Investment Plans (ULIP)">Market Linked Investment Plans (ULIP)</option>
  <option value="Investment Plans for NRIs">Investment Plans for NRIs</option>
  <option value="SIP Calculator">SIP Calculator</option>
  <option value="Capital Guarantee Plans">Capital Guarantee Plans</option>
  <option value="Child Plans">Child Plans</option>
  <option value="Pension Plans">Pension Plans</option>
  <option value="Guaranteed Return Plans">Guaranteed Return Plans</option>
  <option value="Tax Saving Investments">Tax Saving Investments</option>
  <option value="SIP (Systematic Investment Plan)">SIP (Systematic Investment Plan)</option>
  <option value="Endowment Policy">Endowment Policy</option>
  <option value="Money Back Policy">Money Back Policy</option>
  <option value="Annuity Plans">Annuity Plans</option>
  <option value="Income Tax Calculator">Income Tax Calculator</option>
</select>
                            </div>

                            <div className="mt-5">
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First Name"
                                    className="py-2 rounded px-5 md:w-8/12 w-full"
                                    required
                                />
                            </div>

                            <div className="mt-5">
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last Name"
                                    className="py-2 rounded px-5 md:w-8/12 w-full"
                                    required
                                />
                            </div>

                            <div className="mt-5">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    className="py-2 rounded px-5 md:w-8/12 w-full"
                                    required
                                />
                            </div>

                            <div className="mt-5">
                                <input
                                    type="text"
                                    value={mobileNo}
                                    onChange={(e) => setMobileNo(e.target.value)}
                                    placeholder="Mobile Number"
                                    className="py-2 rounded px-5 md:w-8/12 w-full"
                                    required
                                />
                            </div>

                            <div className="mt-5">
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    placeholder="Date of Birth"
                                    className="py-2 rounded px-5 md:w-8/12 w-full"
                                    required
                                />
                            </div>

                            {/* Checkbox */}


                            {/* Submit button */}
                            <div className="mt-5">
                                <button
                                    type="submit"
                                    className="bg-[#4C1F7A] py-2 px-4 text-white md:w-8/12 w-full"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>

                        {/* Right side image */}
                        <div className="cols col-span-6 flex justify-center mt-8">
                            <img
                                src="/images/invest.jpg" // your image path
                                alt="loan offer"
                                className="max-w-full h-[75%] rounded-2xl mt-8"
                            />
                        </div>
                    </div>
                </form>
            </section>

        </>
    );
}
