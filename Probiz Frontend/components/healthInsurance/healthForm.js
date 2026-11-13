import React, { useState } from "react";
import { PostRequest } from "../api-handler";
import swal from "sweetalert";
import { useRouter } from "next/router";
export default function HealthInsuranceForm() {
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
        
        const res = await PostRequest("addInsuranceLoan", item);
        // console.log("res",res);
        
        if(res.status === 200){
             swal({
               icon: "success",
               text: "Health Insurance Offer Submitted Successfully!",
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
                    Unlock Best Health Insurance Offers
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
                                    <option value="">Select Insurance Type</option>
                                    <option value="Individual Health Insurance">Individual Health Insurance</option>
                                    <option value="Family Health Insurance">Family Health Insurance</option>
                                    <option value="Super Top-Up Health Insurance">Super Top-Up Health Insurance</option>
                                    <option value="Critical Illness Health Insurance">Critical Illness Health Insurance</option>
                                    <option value="Personal Accident Insurance Policy">Personal Accident Insurance Policy</option>
                                    <option value="Hospital Daily Cash Insurance">Hospital Daily Cash Insurance</option>
                                    <option value="Mediclaim Insurance">Mediclaim Insurance</option>
                                    <option value="Group Health Insurance">Group Health Insurance</option>
                                    <option value="Disease-Specific (M-Care, Corona Kavach, etc.)">Disease-Specific (M-Care, Corona Kavach, etc.)</option>
                                    <option value="ULIPs Insurance">ULIPs Insurance</option>
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
                                src="/images/health.jpg" // your image path
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
