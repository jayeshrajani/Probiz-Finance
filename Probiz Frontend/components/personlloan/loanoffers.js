import React, { useState } from "react";
import { PostRequest, PostRequestFormControl, runCibilPdfDownloadFromApiResponse } from "../api-handler";
import swal from "sweetalert";
import { useRouter } from "next/router";
export default function LoanOffers() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  // Step 1: Personal Information
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact, setAlternateContact] = useState("");

  // Step 2: personal loan Details
  const [companyname, setCompanyName] = useState("");
  const [managername, setManagerName] = useState("");
  const [managernumber, setManagerNumber] = useState("");
  const [residencetype, setResidenceType] = useState("");
  const [loanAmount, setLoanAmount] = useState("");

  // Step 3: Income Details
  const [profession, setProfession] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [incomeTaxReturn, setIncomeTaxReturn] = useState("");

  const [cibilScore, setCibilScore] = useState("");
  const [cibilCheckLoading, setCibilCheckLoading] = useState(false);
  const [cibilPanForDownload, setCibilPanForDownload] = useState("");
  const [cibilPdfLoading, setCibilPdfLoading] = useState(false);
  const [cibilScoreFetched, setCibilScoreFetched] = useState(false);

  // Step 4: Document Uploads
  const [aadharFront, setAadharFront] = useState("");
  const [aadharBack, setAadharBack] = useState("");
  const [panCard, setPanCard] = useState("");
  const [electricityBill, setElectricityBill] = useState("");

  // Step 5: Additional Document Uploads
  const [bankStatement, setBankStatement] = useState("");
  const [incomeTaxReturnFile, setIncomeTaxReturnFile] = useState("");
  const [salarySlipOrOfferLetter, setSalarySlipOrOfferLetter] = useState("");
  const [forBusiness, setforBusiness] = useState("");
  const [showItrForm, setShowItrForm] = useState(false);

  const nextStep = () => {
    // Validate Step 1 fields before proceeding
    if (step === 1) {
      if (!fullName.trim() || !dob.trim() || !address.trim()) {
        swal({
          icon: "warning",
          title: "Please Try Again",
          text: "Please fill all required fields correctly before proceeding.",
        });
        return;
      }

      if (!contactNumber.trim() || contactNumber.length < 10) {
        swal({
          icon: "warning",
          title: "Please Try Again",
          text: "Contact number must be at least 10 digits.",
        });
        return;
      }
    }

    // Proceed to next step if validation passes
    setStep(step + 1);
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleCheckCibilScore = async () => {
    const panValue = String(cibilScore || "").trim().toUpperCase()
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/

    if (!panRegex.test(panValue)) {
      swal({
        icon: "warning",
        title: "Enter a valid PAN",
        text: "CIBIL check requires PAN in format like ABCDE1234F"
      })
      return
    }

    const userDataRaw = localStorage.getItem("userData") || "{}"
    const userData = JSON.parse(userDataRaw)
    const email = userData?.user_Email || userData?.email

    if (!email) {
      swal({
        icon: "warning",
        title: "Missing email",
        text: "Please login again to fetch your email for the credit report."
      })
      return
    }

    setCibilPanForDownload(panValue)
    setCibilCheckLoading(true)
    try {
      const res = await PostRequest("checkCreditScore", {
        name: fullName,
        email,
        mobile_no: contactNumber,
        pan: panValue,
        includePdf: false
      })

      if (res?.success && res?.data?.score != null) {
        setCibilScore(String(res.data.score))
        setCibilScoreFetched(true)
        swal({
          icon: "success",
          title: "CIBIL score fetched",
          text: `Your CIBIL score is ${res.data.score}`
        })
      } else {
        swal({
          icon: "error",
          title: "Unable to fetch credit score",
          text: res?.message || "Please try again"
        })
      }
    } catch (error) {
      swal({
        icon: "error",
        title: "Credit score failed",
        text: "Please try again."
      })
    } finally {
      setCibilCheckLoading(false)
    }
  }

  const handleDownloadCibilPdf = async () => {
    if (!cibilPanForDownload) {
      swal({
        icon: "warning",
        title: "Check required",
        text: "Please fetch your CIBIL score first."
      })
      return
    }

    const userDataRaw = localStorage.getItem("userData") || "{}"
    const userData = JSON.parse(userDataRaw)
    const email = userData?.user_Email || userData?.email

    if (!email) {
      swal({
        icon: "warning",
        title: "Missing email",
        text: "Please login again to download the PDF."
      })
      return
    }

    setCibilPdfLoading(true)
    try {
      const res = await PostRequest("checkCreditScorePdf", {
        name: fullName,
        email,
        mobile_no: contactNumber,
        pan: cibilPanForDownload
      })

      const feedback = await runCibilPdfDownloadFromApiResponse(res)
      swal({
        icon: feedback.icon,
        title: feedback.title,
        text: feedback.text
      })
    } catch (error) {
      swal({
        icon: "error",
        title: "Download failed",
        text: "Please try again."
      })
    } finally {
      setCibilPdfLoading(false)
    }
  }

  // Calculate max date for DOB (today - 18 years)
  const today = new Date();
  const maxDOB = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  ).toISOString().split("T")[0];


  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();

    // Step 1: Personal Information
    formData.append("fullName", fullName);
    formData.append("dateOfBirth", dob);
    formData.append("address", address);
    formData.append("contactNumber", contactNumber);
    formData.append("alternateContactNumber", alternateContact);

    // Step 2: Employment & Loan
    formData.append("companyName", companyname);
    formData.append("reportingManagerName", managername);
    formData.append("reportingManagerContactNumber", managernumber);
    formData.append("residenceType", residencetype);
    formData.append("loanAmountRequired", loanAmount);

    // Step 3: Income Details
    formData.append("profession", profession);
    formData.append("incomeType", incomeType);
    formData.append("monthlySalary", monthlyIncome);
    formData.append("incomeTaxReturn", incomeTaxReturn);
    formData.append("cibilScore", cibilScore);

    // Step 4: File Uploads (match backend field names!)
    if (aadharFront) formData.append("aadharFront", aadharFront);
    if (aadharBack) formData.append("aadharBack", aadharBack);
    if (panCard) formData.append("panCard", panCard);
    if (electricityBill) formData.append("electricityBillOrRentAgreement", electricityBill);
    if (bankStatement) formData.append("bankStatement", bankStatement);
    if (incomeTaxReturnFile) formData.append("incomeTaxReturnFile", incomeTaxReturnFile);

    // If both salary slip & offer letter exist, upload both separately
    if (salarySlipOrOfferLetter) {
      formData.append("salarySlips", salarySlipOrOfferLetter);
      formData.append("offerLetter", salarySlipOrOfferLetter); // assuming same file for both
    }

    try {
      const response = await PostRequestFormControl("personalLoanApplication", formData);

      if (response.message === "Loan application submitted successfully") {
        swal({
          icon: "success",
          text: "Your information has been securely submitted. We’ll be in touch soon.",
        }).then(() => {
          // Refresh the page after OK click
          router.reload();
        });

        setLoading(false);


      } else {
        swal({
          icon: "error",
          title: "Please Try Again",
          text: response.error.response.data.message,
        });
        // alert(response.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      swal({
        icon: "error",
        text: "Failed to submit. Please try again.",
      });
    }
  };
  // ITR Job Form – Every field separate
  const [itrFullName, setItrFullName] = useState("");
  const [itrPan, setItrPan] = useState("");
  const [itrDob, setItrDob] = useState("");
  const [itrMobile, setItrMobile] = useState("");
  const [itrEmail, setItrEmail] = useState("");

  const [itrAnnualGrossSalary, setItrAnnualGrossSalary] = useState("");
  const [itrTdsForm16, setItrTdsForm16] = useState("");
  const [itrSavingsInterest, setItrSavingsInterest] = useState("");
  const [itrOtherIncome, setItrOtherIncome] = useState("");
  const [itrOtherIncomeDescription, setItrOtherIncomeDescription] = useState("");
  const [itrEligibleDeductions, setItrEligibleDeductions] = useState("");
  const [itrDeductionsDescription, setItrDeductionsDescription] = useState("");
  const [itrTdsForm26AS, setItrTdsForm26AS] = useState("");
  const [itrAdvanceTax, setItrAdvanceTax] = useState("");

  const [itrAccountNumber, setItrAccountNumber] = useState("");
  const [itrIfscCode, setItrIfscCode] = useState("");
  const [itrBankName, setItrBankName] = useState("");
  const [itrAccountType, setItrAccountType] = useState("");

  const [itrPlace, setItrPlace] = useState("");
  const [itrDeclarationDate, setItrDeclarationDate] = useState("");
  const [itrSignature, setItrSignature] = useState("");
  const submitITR = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?._id;
    const payload = {
      userId: userId,
      formType: "job",
      fullName: itrFullName,
      pan: itrPan,
      dateOfBirth: itrDob,
      mobile: itrMobile,
      email: itrEmail,
      annualGrossSalary: itrAnnualGrossSalary,
      tdsAsPerForm16: itrTdsForm16,
      savingsAccountInterest: itrSavingsInterest,
      otherIncome: itrOtherIncome,
      otherIncomeDescription: itrOtherIncomeDescription,
      eligibleDeductions: itrEligibleDeductions,
      deductionsDescription: itrDeductionsDescription,
      tdsAsPerForm26AS: itrTdsForm26AS,
      advanceSelfAssessmentTax: itrAdvanceTax,
      accountNumber: itrAccountNumber,
      ifscCode: itrIfscCode,
      bankName: itrBankName,
      accountType: itrAccountType,
      place: itrPlace,
      declarationDate: itrDeclarationDate,
      signature: itrSignature,
    };

    console.log("payload data is --->", payload)

    try {
      const res = await PostRequest("submitITRInformation", payload
      );

      console.log("sumit itr api res is --->", res)
      if (res.status === 200) {
        swal({
          icon: "success",
          text: "ITR information submitted successfully",
        });
        setShowItrForm(false);
      }
      else {
        swal({
          icon: "error",
          title: "Please Try Again",
          text: res.message,
        });
      }
    } catch (err) {
      swal({
        icon: "error",
        title: "Submission Failed",
        text: "Please try again",
      });
      setShowItrForm(false);
    }
  };

  return (
    <section className="bg-[#FF7F00] py-10 md:px-12 mt-10">
      <h1 className="text-white text-4xl text-center">
        Unlock Best Personal Loan Offers
      </h1>
      <p className="text-white text-base text-center mt-3">
        "Apply today and take the first step toward achieving your financial
        goals with confidence!"
      </p>



      <div className="grid md:grid-cols-12 mt-10">
        <div className="col-span-6 px-5">
          <div className="flex justify-center mt-6">
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  className={`w-12 h-12 flex items-center justify-center rounded-full font-semibold text-lg transition-all duration-300 shadow-md 
          ${step === num
                      ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/50"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
          {step === 1 && (
            <>
              <div className="flex justify-around">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name (As per Aadhaar)"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <div className="w-[60%] mt-5">
                  <label className="block text-white mb-2">
                    Date of Birth (As per Aadhaar)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={maxDOB}
                    placeholder="Date of Birth (As per Aadhaar)"
                    className="py-2 rounded px-5 w-full"
                  />
                </div>
              </div>
              <div className="flex justify-around">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address (As per Aadhaar)"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={contactNumber}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      setContactNumber(input);
                    }
                  }}
                  placeholder="Contact Number (Joint with Aadhaar)"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={alternateContact}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      setAlternateContact(input);
                    }
                  }}
                  placeholder="Alternate Contact Number"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="flex justify-around">
                <input
                  value={companyname}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name "
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={managername}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Reporting Manager Name"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={managernumber}
                  onChange={(e) => setManagerNumber(e.target.value)}
                  placeholder="Reporting Manager Contact Number"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <select
                  value={residencetype}
                  onChange={(e) => setResidenceType(e.target.value)}
                  className="py-2 rounded px-5 w-[60%] mt-5"
                >
                  <option>Residence Type </option>
                  <option>Owned</option>
                  <option>Rented</option>
                </select>
              </div>
              <div className="flex justify-around">
                <input
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="Loan Amount Required"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="flex justify-around">
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="py-2 rounded px-5 w-[60%] mt-5"
                >
                  <option>Profession</option>
                  <option>Job</option>
                  {/* <option>Business</option> */}
                </select>
              </div>
              <div className="flex justify-around">
                <select
                  value={incomeType}
                  onChange={(e) => setIncomeType(e.target.value)}
                  className="py-2 rounded px-5 w-[60%] mt-5"
                >
                  <option>Income Type</option>
                  <option>Cash</option>
                  <option>Account</option>
                  <option>Both</option>
                </select>
              </div>
              <div className="flex justify-around">
                <input
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="Total Monthly Income"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <select
                  value={incomeTaxReturn}
                  onChange={(e) => setIncomeTaxReturn(e.target.value)}
                  className="py-2 rounded px-5 w-[60%] mt-5"
                >
                  <option>Income Tax Return</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              {incomeTaxReturn === "No" && (
                <p
                  className="text-white text-center mt-3 underline cursor-pointer"
                  onClick={() => setShowItrForm(true)}
                >
                  Apply Now (Itr form)
                </p>
              )}


              <div className="flex justify-around">
                <input
                  value={cibilScore}
                  onChange={(e) => setCibilScore(e.target.value)}
                  placeholder="PAN (for CIBIL) – Check Now"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
                <button
                  type="button"
                  aria-label="Check CIBIL score"
                  onClick={handleCheckCibilScore}
                  disabled={cibilCheckLoading}
                  className="py-2 rounded px-4 mt-5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600"
                >
                  {cibilCheckLoading ? "Checking..." : "Check Now"}
                </button>
              </div>
              {cibilScoreFetched && (
                <div className="flex justify-center mt-3">
                  <button
                    type="button"
                    aria-label="Download CIBIL PDF"
                    onClick={handleDownloadCibilPdf}
                    disabled={cibilPdfLoading}
                    className="py-2 rounded px-4 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 disabled:hover:bg-purple-600"
                  >
                    {cibilPdfLoading
                      ? "Downloading..."
                      : "Download CIBIL PDF (₹99)"}
                  </button>
                </div>
              )}
            </>
          )}
          {step === 4 && (
            <>
              <p className="text-white text-xl font-bold mt-5">
                Upload Required Documents:
              </p>

              <label className="text-white block mt-3 font-semibold">
                Aadhar Front
              </label>
              <input
                type="file"
                name="aadharFront"
                className="py-2 w-full mt-2"
                onChange={(e) => setAadharFront(e.target.files[0])}
              />

              <label className="text-white block mt-3 font-semibold">
                Aadhar Back Side
              </label>
              <input
                type="file"
                name="aadharBack"
                className="py-2 w-full mt-2"
                onChange={(e) => setAadharBack(e.target.files[0])}
              />

              <label className="text-white block mt-3 font-semibold">
                PAN Card
              </label>
              <input
                type="file"
                name="panCard"
                className="py-2 w-full mt-2"
                onChange={(e) => setPanCard(e.target.files[0])}
              />

              <label className="text-white block mt-3 font-semibold">
                Electricity Bill / Rent Agreement
              </label>
              <input
                type="file"
                name="electricityBill"
                className="py-2 w-full mt-2"
                onChange={(e) => setElectricityBill(e.target.files[0])}
              />
            </>
          )}
          {step === 5 && (
            <>
              <p className="text-white text-xl font-bold mt-5">
                Upload Additional Documents:
              </p>

              <label className="text-white block mt-3 font-semibold">
                Bank Statement
              </label>
              <input
                type="file"
                className="py-2 w-full mt-2"
                onChange={(e) => setBankStatement(e.target.files[0])}
              />

              <label className="text-white block mt-3 font-semibold">
                Income Tax Return File (If Available)
              </label>
              <input
                type="file"
                className="py-2 w-full mt-2"
                onChange={(e) => setIncomeTaxReturnFile(e.target.files[0])}
              />
              {profession === "Job" ? (
                <>
                  <label className="text-white block mt-3 font-semibold">
                    Salary Slip or Offer Letter
                  </label>
                  <input
                    type="file"
                    className="py-2 w-full mt-2"
                    onChange={(e) =>
                      setSalarySlipOrOfferLetter(e.target.files[0])
                    }
                  />
                </>
              ) : (
                <>
                  <label className="text-white block mt-3 font-semibold">
                    Gumasta, MSME License, Nagar Nigam, Others
                  </label>
                  <input
                    type="file"
                    className="py-2 w-full mt-2"
                    onChange={(e) => setforBusiness(e.target.files[0])}
                  />
                </>
              )}
            </>
          )}

          <div className="flex justify-between mt-5">
            {step >= 1 && (
              <button
                onClick={prevStep}
                className="bg-gray-500 py-2 px-4 text-white rounded"
              >
                Back
              </button>
            )}
            {step < 5 ? (
              <button
                onClick={nextStep}
                className="bg-[#4C1F7A] py-2 px-4 text-white rounded"
              >
                Next
              </button>
            ) : (
              <button className="bg-green-600 py-2 px-4 text-white rounded" onClick={handleSubmit}>
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </div>
        <div className="col-span-6 flex justify-center">
          <img
            src="/images/PersonalLoanImages.png"
            alt="loan offer"
            className="max-w-full h-[75%] rounded-2xl"
          />
        </div>

        {/* ********** itr form ********** */}
        {showItrForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-[95%] md:w-[65%] p-6 rounded-lg max-h-[90%] overflow-y-auto">

              <h2 className="text-xl font-bold mb-4">Quick ITR Information Forms</h2>

              {/* ============================================================ */}
              {/* A. JOB ITR – SALARY INCOME */}
              {/* ============================================================ */}
              <h3 className="text-lg font-bold mb-2">A. Job ITR – Salary Income</h3>

              {/* ----- 1. Basic Information ----- */}
              <h4 className="font-semibold mt-4">1. Basic Information</h4>
              <p className="text-xs text-gray-500 mt-1">Fields marked with <span className="text-red-600 font-semibold">*</span> are required.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Full Name (as per PAN) <span className="text-red-600" aria-label="required">*</span></label>
                  <input className="border p-2 w-full" placeholder="Full Name (as per PAN)"
                    value={itrFullName} onChange={(e) => setItrFullName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">PAN <span className="text-red-600" aria-label="required">*</span></label>
                  <input className="border p-2 w-full" placeholder="PAN (e.g. ABCDE1234F)"
                    value={itrPan} onChange={(e) => setItrPan(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date of birth <span className="text-red-600" aria-label="required">*</span></label>
                  <input type="date" className="border p-2 w-full"
                    value={itrDob} onChange={(e) => setItrDob(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mobile <span className="text-red-600" aria-label="required">*</span></label>
                  <input className="border p-2 w-full" placeholder="10-digit mobile number"
                    value={itrMobile} onChange={(e) => setItrMobile(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Email <span className="text-red-600" aria-label="required">*</span></label>
                  <input className="border p-2 w-full" placeholder="Email"
                    value={itrEmail} onChange={(e) => setItrEmail(e.target.value)} />
                </div>
              </div>

              {/* ----- 2. Salary Income ----- */}
              <h4 className="font-semibold mt-6">2. Salary Income <span className="text-gray-400 text-sm font-normal">(optional)</span></h4>
              <div className="space-y-3 mt-2">
                <input className="border p-2 w-full" placeholder="Annual Gross Salary (₹)"
                  value={itrAnnualGrossSalary} onChange={(e) => setItrAnnualGrossSalary(e.target.value)} />

                <input className="border p-2 w-full" placeholder="TDS as per Form 16 (₹)"
                  value={itrTdsForm16} onChange={(e) => setItrTdsForm16(e.target.value)} />
              </div>

              {/* ----- 3. Other Income ----- */}
              <h4 className="font-semibold mt-6">3. Other Income <span className="text-gray-400 text-sm font-normal">(optional)</span></h4>
              <div className="space-y-3 mt-2">
                <input className="border p-2 w-full" placeholder="Savings Account Interest (₹)"
                  value={itrSavingsInterest} onChange={(e) => setItrSavingsInterest(e.target.value)} />

                <input className="border p-2 w-full" placeholder="Other Income (Dividend, FD Interest, etc.)"
                  value={itrOtherIncome} onChange={(e) => setItrOtherIncome(e.target.value)} />

                <input className="border p-2 w-full" placeholder="Other Income Description"
                  value={itrOtherIncomeDescription} onChange={(e) => setItrOtherIncomeDescription(e.target.value)} />
              </div>

              {/* ----- 4. Total Deductions ----- */}
              <h4 className="font-semibold mt-6">4. Total Deductions <span className="text-gray-400 text-sm font-normal">(optional)</span></h4>
              <input className="border p-2 w-full" placeholder="Eligible Deductions (80C, 80D, 80G etc.)"
                value={itrEligibleDeductions} onChange={(e) => setItrEligibleDeductions(e.target.value)} />

              <input className="border p-2 w-full mt-3" placeholder="Deductions Description"
                value={itrDeductionsDescription} onChange={(e) => setItrDeductionsDescription(e.target.value)} />

              {/* ----- 5. Tax Already Paid ----- */}
              <h4 className="font-semibold mt-6">5. Tax Already Paid <span className="text-gray-400 text-sm font-normal">(optional)</span></h4>
              <div className="space-y-3">
                <input className="border p-2 w-full" placeholder="TDS as per Form 26AS (₹)"
                  value={itrTdsForm26AS} onChange={(e) => setItrTdsForm26AS(e.target.value)} />

                <input className="border p-2 w-full" placeholder="Advance/Self Assessment Tax (₹)"
                  value={itrAdvanceTax} onChange={(e) => setItrAdvanceTax(e.target.value)} />
              </div>

              {/* ----- 6. Bank Details for Refund ----- */}
              <h4 className="font-semibold mt-6">6. Bank Details for Refund</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Account number <span className="text-red-600" aria-label="required">*</span></label>
                  <input className="border p-2 w-full" placeholder="Account Number"
                    value={itrAccountNumber} onChange={(e) => setItrAccountNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">IFSC code <span className="text-red-600" aria-label="required">*</span></label>
                  <input className="border p-2 w-full" placeholder="IFSC (e.g. HDFC0001234)"
                    value={itrIfscCode} onChange={(e) => setItrIfscCode(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Bank name <span className="text-red-600" aria-label="required">*</span></label>
                  <input className="border p-2 w-full" placeholder="Bank Name"
                    value={itrBankName} onChange={(e) => setItrBankName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Account type <span className="text-red-600" aria-label="required">*</span></label>
                  <select className="border p-2 w-full"
                    value={itrAccountType} onChange={(e) => setItrAccountType(e.target.value)}>
                    <option value="">Select account type</option>
                    <option>Savings</option>
                    <option>Current</option>
                    <option>Fixed Deposit</option>
                    <option>Recurring Deposit</option>
                  </select>
                </div>
              </div>

              {/* ----- 7. Declaration ----- */}
              <h4 className="font-semibold mt-6">7. Declaration (optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Place</label>
                  <input className="border p-2 w-full" placeholder="Place"
                    value={itrPlace} onChange={(e) => setItrPlace(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Declaration date</label>
                  <input type="date" className="border p-2 w-full"
                    value={itrDeclarationDate} onChange={(e) => setItrDeclarationDate(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Signature (name as on record)</label>
                  <input className="border p-2 w-full" placeholder="Signature"
                    value={itrSignature} onChange={(e) => setItrSignature(e.target.value)} />
                </div>
              </div>


              {/* -------- Submit ITR Button -------- */}
              <div className="flex justify-center mt-6">
                <button onClick={submitITR} className="bg-green-600 text-white py-2 px-5 rounded">
                  Submit ITR Form
                </button>
              </div>

              {/* -------- CLOSE BUTTON -------- */}
              <div className="flex justify-end mt-4">
                <button onClick={() => setShowItrForm(false)}
                  className="bg-red-500 text-white py-2 px-4 rounded">
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}
