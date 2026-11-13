import React, { useState } from "react";
import { PostRequest, PostRequestFormControl, runCibilPdfDownloadFromApiResponse } from "../api-handler";
import swal from "sweetalert";
import { useRouter } from "next/router";
export default function LoanOffers() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Step 1: Personal Information
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact, setAlternateContact] = useState("");

  // Step 2: Income Details
  const [profession, setProfession] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [cibilCheckLoading, setCibilCheckLoading] = useState(false);
  const [cibilPanForDownload, setCibilPanForDownload] = useState("");
  const [cibilPdfLoading, setCibilPdfLoading] = useState(false);
  const [cibilScoreFetched, setCibilScoreFetched] = useState(false);

  // Step 3: Required Document Uploads
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [electricityBill, setElectricityBill] = useState(null);

  // Step 4: Additional Document Uploads
  const [bankStatement, setBankStatement] = useState(null);
  const [salarySlipOrOfferLetter, setSalarySlipOrOfferLetter] = useState(null);

  // Step Management
  const [step, setStep] = useState(1);

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
    const formData = new FormData();
    setLoading(true);
    // Step 1: Personal Information
    formData.append("fullName", fullName);
    formData.append("dateOfBirth", dob);
    formData.append("address", address);
    formData.append("contactNumber", contactNumber);
    formData.append("alternateContact", alternateContact);

    // Step 2: Income Details
    formData.append("profession", profession);
    formData.append("incomeType", incomeType);
    formData.append("monthlyIncome", monthlyIncome);
    formData.append("cibilScore", cibilScore);
    formData.append("businessCertificate", businessCertificate);

    // Step 3: Required Document Uploads
    formData.append("aadharFront", aadharFront);
    formData.append("aadharBack", aadharBack);
    formData.append("panCard", panCard);
    formData.append("electricityBill", electricityBill);

    // Step 4: Additional Document Uploads
    formData.append("bankStatement", bankStatement);
    formData.append("salarySlipOrOfferLetter", salarySlipOrOfferLetter);

    try {
      const response = await PostRequestFormControl("creditCardDetail", formData);

      if (response.message === "Credit Card Detail submitted successfully") {
        // Reset state after successful submission
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
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      swal({
        icon: "error",
        text: "Failed to submit. Please try again.",
      });
    }
  };


  // ********** MSME Form fields **********
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [nameOnAadhaar, setNameOnAadhaar] = useState("");
  const [mobileLinkedToAadhaar, setMobileLinkedToAadhaar] = useState("");
  const [emailMSME, setEmailMSME] = useState("");
  const [enterpriseName, setEnterpriseName] = useState("");
  const [organisationType, setOrganisationType] = useState("");
  const [panMSME, setPanMSME] = useState("");
  const [gstin, setGstin] = useState("");
  const [doorShopNo, setDoorShopNo] = useState("");
  const [street, setStreet] = useState("");
  const [areaLocality, setAreaLocality] = useState("");
  const [cityMSME, setCityMSME] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [msmeDate, setMsmeDate] = useState("");
  const [majorActivity, setMajorActivity] = useState("");
  const [nicCode, setNicCode] = useState("");
  const [descriptionMSME, setDescriptionMSME] = useState("");
  const [totalEmployeesMale, setTotalEmployeesMale] = useState("");
  const [totalEmployeesFemale, setTotalEmployeesFemale] = useState("");
  const [totalEmployeesOthers, setTotalEmployeesOthers] = useState("");
  const [investmentInMachineryEquipment, setInvestmentInMachineryEquipment] = useState("");
  const [annualTurnoverLastFY, setAnnualTurnoverLastFY] = useState("");

  const [accountNumberMSME, setAccountNumberMSME] = useState("");
  const [ifscCodeMSME, setIfscCodeMSME] = useState("");
  const [bankNameMSME, setBankNameMSME] = useState("");
  const [accountTypeMSME, setAccountTypeMSME] = useState("");
  const [placeMSME, setPlaceMSME] = useState("");
  const [declarationDateMSME, setDeclarationDateMSME] = useState("");
  const [signatureMSME, setSignatureMSME] = useState("");
  // ********** Submit MSME API **********
  const submitMSME = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?._id;

    const payload = {
      userId: userId,
      aadhaarNo,
      nameOnAadhaar,
      mobileLinkedToAadhaar,
      email: emailMSME,
      enterpriseName,
      organisationType,   // REQUIRED ✔
      pan: panMSME,
      gstin,
      doorShopNo,
      street,
      areaLocality,
      city: cityMSME,
      pinCode,
      date: msmeDate,
      majorActivity,       // REQUIRED ✔
      nicCode,
      description: descriptionMSME,
      totalEmployeesMale,
      totalEmployeesFemale,
      totalEmployeesOthers,
      investmentInMachineryEquipment,
      annualTurnoverLastFY,
      accountNumber: accountNumberMSME,
      ifscCode: ifscCodeMSME,
      bankName: bankNameMSME,
      accountType: accountTypeMSME,
      place: placeMSME,
      declarationDate: declarationDateMSME,
      signature: signatureMSME,
    };

    console.log("msme data is --->", payload)
    try {
      const res = await PostRequest("submitMSMERegistration", payload);
      console.log("MSME API Response --->", res);

      if (res.status === 200) {
        swal({
          icon: "success",
          text: "MSME information submitted successfully!",
        });
        setShowMSMEForm(false);
      } else {
        swal({
          icon: "error",
          title: "Error",
          text: res.message,
        });
      }
    } catch (error) {
      swal({
        icon: "error",
        title: "Submission Failed",
        text: "Please try again.",
      });
    }
  };


  // ******** GUMASTA FORM STATES ********
  const [applicantAuthorizedPersonName, setApplicantAuthorizedPersonName] = useState("");
  const [fatherSpouseName, setFatherSpouseName] = useState("");
  const [designation, setDesignation] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [emailId, setEmailId] = useState("");
  const [aadhaarNoGumasta, setAadhaarNoGumasta] = useState("");
  const [panNo, setPanNo] = useState("");

  const [firmName, setFirmName] = useState("");
  const [buildingShopNo, setBuildingShopNo] = useState("");
  const [streetRoad, setStreetRoad] = useState("");
  const [areaLocalityG, setAreaLocalityG] = useState("");
  const [cityG, setCityG] = useState("");
  const [district, setDistrict] = useState("");
  const [pinCodeG, setPinCodeG] = useState("");
  const [natureOfBusinessActivity, setNatureOfBusinessActivity] = useState("");

  const [categoryShop, setCategoryShop] = useState(false);
  const [categoryCommercialEstablishment, setCategoryCommercialEstablishment] = useState(false);

  const [premisesStatus, setPremisesStatus] = useState(""); // Owned / Rented / Leased
  const [dateOfEstablishment, setDateOfEstablishment] = useState("");

  const [totalEmployeesMaleG, setTotalEmployeesMaleG] = useState("");
  const [totalEmployeesFemaleG, setTotalEmployeesFemaleG] = useState("");
  const [totalEmployeesDifferentlyG, setTotalEmployeesDifferentlyG] = useState("");

  // Document Checklist
  const [panCopy, setPanCopy] = useState(false);
  const [aadhaarCopy, setAadhaarCopy] = useState(false);
  const [addressProof, setAddressProof] = useState(false);
  const [photographOfSignboard, setPhotographOfSignboard] = useState(false);
  const [rentLeaseAgreement, setRentLeaseAgreement] = useState(false);
  const [showGumastaForm, setShowGumastaForm] = useState(false);
  const [showMSMEForm, setShowMSMEForm] = useState(false);
  const [showGSTForm, setShowGSTForm] = useState(false);
  const [businessCertificate, setBusinessCertificate] = useState("");

  // ********** Submit Gumasta API **********
  const submitGumasta = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?._id;

    const payload = {
      userId: userId,
      applicantAuthorizedPersonName,
      fatherSpouseName,
      designation,
      mobileNo,
      emailId,
      aadhaarNo: aadhaarNoGumasta,
      panNo,
      firmName,
      buildingShopNo,
      streetRoad,
      areaLocality: areaLocalityG,
      city: cityG,
      district,
      pinCode: pinCodeG,
      natureOfBusinessActivity,
      category: {
        shop: categoryShop,
        commercialEstablishment: categoryCommercialEstablishment
      },
      premisesStatus,
      dateOfEstablishment,
      totalEmployeesMale: totalEmployeesMaleG,
      totalEmployeesFemale: totalEmployeesFemaleG,
      totalEmployeesDifferently: totalEmployeesDifferentlyG,
      documentChecklist: {
        panCopy,
        aadhaarCopy,
        addressProof,
        photographOfSignboard,
        rentLeaseAgreement
      }
    };

    console.log("Gumasta Payload ---->", payload);

    try {
      const res = await PostRequest("submitGumastaLicense", payload);
      console.log("gumasta api res i --->", res)
      if (res.status === 200) {
        swal({
          icon: "success",
          text: "Gumasta License submitted successfully!",
        });
        setShowGumastaForm(false);
      } else {
        swal({
          icon: "error",
          title: "Error",
          text: res.message,
        });
      }
    } catch (error) {
      swal({
        icon: "error",
        title: "Submission Failed",
        text: "Please try again.",
      });
    }
  };

  return (
    <section className="bg-[#FF7F00] py-10 md:px-12 mt-10">
      <h1 className="text-white text-4xl text-center">
        Unlock Best Credit Card Offers
      </h1>
      <p className="text-white text-base text-center mt-3">
        "Discover exclusive credit card offers with exciting rewards, cashback,
        and flexible spending limits!"
      </p>



      <div className="grid md:grid-cols-12 mt-10">
        <div className="col-span-6 px-5">
          <div className="flex justify-center mt-6">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map((num) => (
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
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="py-2 rounded px-5 w-[60%] mt-5"
                >
                  <option>Profession</option>
                  <option>Job</option>
                  <option>Business</option>
                </select>
              </div>
              {profession === "Business" && (
                <div className="flex justify-around">
                  <select
                    value={businessCertificate}
                    onChange={(e) => setBusinessCertificate(e.target.value)}
                    className="py-2 rounded px-5 w-[60%] mt-5"
                  >
                    <option>Business Certificate</option>
                    <option>Gumasta</option>
                    <option>MSME</option>
                    <option>Nagar Nigam Certificate</option>
                    <option>Certificate of Incorporation</option>
                    <option>Gst Number</option>
                    <option>Others</option>
                    <option>No</option>
                  </select>
                </div>
              )}

              {businessCertificate === "Gumasta" && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setShowGumastaForm(true)}
                    className="text-white underline"
                  >
                    Apply Now (Gumasta License)
                  </button>
                </div>
              )}

              {businessCertificate === "MSME" && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setShowMSMEForm(true)}
                    className="text-white underline"
                  >
                    Apply Now (MSME Registration)
                  </button>
                </div>
              )}
              {businessCertificate === "Gst Number" && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setShowGSTForm(true)}
                    className="text-white underline mt-3 text-center"
                  >
                    Apply Now (GST Form)
                  </button>
                </div>
              )}
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

              <div className="flex justify-around gap-2">
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

          {step === 3 && (
            <>
              <p className="text-white text-xl font-bold mt-5">Upload Required Documents:</p>
              <label className="text-white block mt-3 font-semibold">Aadhar Front</label>
              <input type="file" className="py-2 w-full mt-2" onChange={(e) => setAadharFront(e.target.files[0])} />
              <label className="text-white block mt-3 font-semibold">Aadhar Back Side</label>
              <input type="file" className="py-2 w-full mt-2" onChange={(e) => setAadharBack(e.target.files[0])} />
              <label className="text-white block mt-3 font-semibold">PAN Card</label>
              <input type="file" className="py-2 w-full mt-2" onChange={(e) => setPanCard(e.target.files[0])} />
              <label className="text-white block mt-3 font-semibold">Electricity Bill / Rent Agreement</label>
              <input type="file" className="py-2 w-full mt-2" onChange={(e) => setElectricityBill(e.target.files[0])} />
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-white text-xl font-bold mt-5">Upload Additional Documents:</p>
              <label className="text-white block mt-3 font-semibold">Bank Statement</label>
              <input type="file" className="py-2 w-full mt-2" onChange={(e) => setBankStatement(e.target.files[0])} />
              <label className="text-white block mt-3 font-semibold">For Salaried Employee – Last Three Salary Slip</label>
              <input type="file" className="py-2 w-full mt-2" onChange={(e) => setSalarySlipOrOfferLetter(e.target.files[0])} />
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
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="bg-[#4C1F7A] py-2 px-4 text-white rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-green-600 py-2 px-4 text-white rounded"
              >
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
        <div className="col-span-6 flex justify-center ">
          <img src="/images/Credit Card.png" alt="loan offer" className="max-w-full h-[75%] rounded-2xl mt-4" />
        </div>
      </div>

      {/* ******** gumasta form ********* */}
      {showGumastaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[95%] md:w-[55%] p-6 rounded-lg max-h-[90%] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4">Gumasta License – Information Sheet</h2>

            {/* 1. Applicant Details */}
            <h3 className="font-semibold mt-4">1. Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">

              <input className="border p-2"
                placeholder="Applicant / Authorized Person Name"
                value={applicantAuthorizedPersonName}
                onChange={(e) => setApplicantAuthorizedPersonName(e.target.value)}
              />

              <input className="border p-2"
                placeholder="Father / Spouse Name"
                value={fatherSpouseName}
                onChange={(e) => setFatherSpouseName(e.target.value)}
              />

              <select
                className="border p-2"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Select Designation</option>
                <option value="Owner">Owner</option>
                <option value="Partner">Partner</option>
                <option value="Director">Director</option>
              </select>


              <input className="border p-2"
                placeholder="Mobile No."
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
              />

              <input className="border p-2"
                placeholder="Email ID"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />

              <input className="border p-2"
                placeholder="Aadhaar No."
                value={aadhaarNoGumasta}
                onChange={(e) => setAadhaarNoGumasta(e.target.value)}
              />

              <input className="border p-2"
                placeholder="PAN No."
                value={panNo}
                onChange={(e) => setPanNo(e.target.value)}
              />

            </div>

            {/* 2. Establishment Details */}
            <h3 className="font-semibold mt-6">2. Establishment Details</h3>

            <input className="border p-2 w-full mt-2"
              placeholder="Firm Name"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
            />

            <input className="border p-2 w-full mt-3"
              placeholder="Building / Shop No."
              value={buildingShopNo}
              onChange={(e) => setBuildingShopNo(e.target.value)}
            />

            <input className="border p-2 w-full mt-3"
              placeholder="Street / Road"
              value={streetRoad}
              onChange={(e) => setStreetRoad(e.target.value)}
            />

            <input className="border p-2 w-full mt-3"
              placeholder="Area / Locality"
              value={areaLocalityG}
              onChange={(e) => setAreaLocalityG(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <input className="border p-2"
                placeholder="City"
                value={cityG}
                onChange={(e) => setCityG(e.target.value)}
              />

              <input className="border p-2"
                placeholder="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />

              <input className="border p-2"
                placeholder="PIN Code"
                value={pinCodeG}
                onChange={(e) => setPinCodeG(e.target.value)}
              />
            </div>

            <input className="border p-2 w-full mt-3"
              placeholder="Nature of Business Activity"
              value={natureOfBusinessActivity}
              onChange={(e) => setNatureOfBusinessActivity(e.target.value)}
            />

            {/* Category */}
            <h3 className="font-semibold mt-6">Category</h3>
            <div className="flex gap-6 mt-2">
              <label>
                <input type="checkbox"
                  checked={categoryShop}
                  onChange={() => setCategoryShop(!categoryShop)}
                /> Shop
              </label>

              <label>
                <input type="checkbox"
                  checked={categoryCommercialEstablishment}
                  onChange={() => setCategoryCommercialEstablishment(!categoryCommercialEstablishment)}
                /> Commercial Establishment
              </label>
            </div>

            {/* Premises Status */}
            <h3 className="font-semibold mt-6">Premises Status</h3>
            <div className="flex gap-6 mt-2">
              {["Owned", "Rented", "Leased"].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="premisesStatus"
                    value={type}
                    onChange={(e) => setPremisesStatus(e.target.value)}
                  />{" "}
                  {type}
                </label>
              ))}
            </div>

            <input
              type="date"
              className="border p-2 w-full mt-3"
              value={dateOfEstablishment}
              onChange={(e) => setDateOfEstablishment(e.target.value)}
            />

            {/* Employees */}
            <h3 className="font-semibold mt-6">Employees</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <input className="border p-2" placeholder="Male"
                value={totalEmployeesMaleG}
                onChange={(e) => setTotalEmployeesMaleG(e.target.value)}
              />

              <input className="border p-2" placeholder="Female"
                value={totalEmployeesFemaleG}
                onChange={(e) => setTotalEmployeesFemaleG(e.target.value)}
              />

              <input className="border p-2" placeholder="Differently Abled"
                value={totalEmployeesDifferentlyG}
                onChange={(e) => setTotalEmployeesDifferentlyG(e.target.value)}
              />
            </div>

            {/* Document Checklist */}
            <h3 className="font-semibold mt-6">Document Checklist</h3>
            <div className="space-y-2 mt-2">

              <label><input type="checkbox" checked={panCopy} onChange={() => setPanCopy(!panCopy)} /> PAN Copy</label><br />

              <label><input type="checkbox" checked={aadhaarCopy} onChange={() => setAadhaarCopy(!aadhaarCopy)} /> Aadhaar Copy</label><br />

              <label><input type="checkbox" checked={addressProof} onChange={() => setAddressProof(!addressProof)} /> Address Proof</label><br />

              <label><input type="checkbox" checked={photographOfSignboard} onChange={() => setPhotographOfSignboard(!photographOfSignboard)} /> Photograph of Signboard</label><br />

              <label><input type="checkbox" checked={rentLeaseAgreement} onChange={() => setRentLeaseAgreement(!rentLeaseAgreement)} /> Rent/Lease Agreement</label>

            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={submitGumasta}
                className="bg-green-600 text-white py-2 px-6 rounded"
              >
                Submit Gumasta Form
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowGumastaForm(false)}
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ************* msme form *********** */}
      {showMSMEForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[95%] md:w-[55%] p-6 rounded-lg max-h-[90%] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4">
              Udyam (MSME) Registration – Quick Information Sheet
            </h2>

            {/* 1. APPLICANT */}
            <h3 className="font-semibold mt-4">1. Applicant</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">

              <input
                className="border p-2"
                placeholder="Aadhaar No."
                value={aadhaarNo}
                onChange={(e) => setAadhaarNo(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="Name on Aadhaar"
                value={nameOnAadhaar}
                onChange={(e) => setNameOnAadhaar(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="Mobile (Linked to Aadhaar)"
                value={mobileLinkedToAadhaar}
                onChange={(e) => setMobileLinkedToAadhaar(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="Email"
                value={emailMSME}
                onChange={(e) => setEmailMSME(e.target.value)}
              />

            </div>

            {/* 2. BUSINESS IDENTITY */}
            <h3 className="font-semibold mt-6">2. Business Identity</h3>

            <input
              className="border p-2 w-full mt-2"
              placeholder="Enterprise Name"
              value={enterpriseName}
              onChange={(e) => setEnterpriseName(e.target.value)}
            />

            {/* Organisation Type */}
            <div className="mt-3">
              <label className="font-semibold">Organisation Type:</label>
              <div className="flex gap-4 mt-2 flex-wrap">

                {["Proprietor", "Partnership", "LLP", "Pvt Ltd", "Other"].map((type) => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="organisationType"
                      value={type}
                      onChange={(e) => setOrganisationType(e.target.value)}
                    />{" "}
                    {type}
                  </label>
                ))}

              </div>
            </div>

            <input
              className="border p-2 w-full mt-3"
              placeholder="PAN"
              value={panMSME}
              onChange={(e) => setPanMSME(e.target.value)}
            />

            <input
              className="border p-2 w-full mt-3"
              placeholder="GSTIN (optional)"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
            />

            {/* 3. ADDRESS */}
            <h3 className="font-semibold mt-6">3. Address</h3>

            <input
              className="border p-2 w-full mt-2"
              placeholder="Door / Shop No."
              value={doorShopNo}
              onChange={(e) => setDoorShopNo(e.target.value)}
            />

            <input
              className="border p-2 w-full mt-3"
              placeholder="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />

            <input
              className="border p-2 w-full mt-3"
              placeholder="Area / Locality"
              value={areaLocality}
              onChange={(e) => setAreaLocality(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">

              <input
                className="border p-2"
                placeholder="City"
                value={cityMSME}
                onChange={(e) => setCityMSME(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="PIN Code"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
              />

            </div>

            {/* 4. KEY FACTS */}
            <h3 className="font-semibold mt-6">4. Key Facts</h3>

            <input
              type="date"
              className="border p-2 w-full"
              value={msmeDate}
              onChange={(e) => setMsmeDate(e.target.value)}
            />

            {/* Major Activity */}
            <div className="mt-3">
              <label className="font-semibold">Major Activity:</label>
              <div className="flex gap-4 mt-2">

                <label>
                  <input
                    type="radio"
                    name="majorActivity"
                    value="Manufacturing"
                    onChange={(e) => setMajorActivity(e.target.value)}
                  />{" "}
                  Manufacturing
                </label>

                <label>
                  <input
                    type="radio"
                    name="majorActivity"
                    value="Services"
                    onChange={(e) => setMajorActivity(e.target.value)}
                  />{" "}
                  Services
                </label>

              </div>
            </div>

            <input
              className="border p-2 w-full mt-3"
              placeholder="NIC Code"
              value={nicCode}
              onChange={(e) => setNicCode(e.target.value)}
            />

            <input
              className="border p-2 w-full mt-3"
              placeholder="Description"
              value={descriptionMSME}
              onChange={(e) => setDescriptionMSME(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">

              <input
                className="border p-2"
                placeholder="Employees Male"
                value={totalEmployeesMale}
                onChange={(e) => setTotalEmployeesMale(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="Female"
                value={totalEmployeesFemale}
                onChange={(e) => setTotalEmployeesFemale(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="Others"
                value={totalEmployeesOthers}
                onChange={(e) => setTotalEmployeesOthers(e.target.value)}
              />

            </div>

            {/* 5. FINANCIAL SIZE */}
            <h3 className="font-semibold mt-6">5. Financial Size</h3>

            <input
              className="border p-2 w-full mt-2"
              placeholder="Investment in Machinery / Equipment (₹)"
              value={investmentInMachineryEquipment}
              onChange={(e) => setInvestmentInMachineryEquipment(e.target.value)}
            />

            <input
              className="border p-2 w-full mt-3"
              placeholder="Annual Turnover (Last FY)"
              value={annualTurnoverLastFY}
              onChange={(e) => setAnnualTurnoverLastFY(e.target.value)}
            />

            {/* 6. BANK DETAILS */}
            <h3 className="font-semibold mt-6">6. Bank Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <input
                className="border p-2"
                placeholder="Account Number"
                value={accountNumberMSME}
                onChange={(e) => setAccountNumberMSME(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="IFSC Code"
                value={ifscCodeMSME}
                onChange={(e) => setIfscCodeMSME(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="Bank Name"
                value={bankNameMSME}
                onChange={(e) => setBankNameMSME(e.target.value)}
              />

              <select
                className="border p-2"
                value={accountTypeMSME}
                onChange={(e) => setAccountTypeMSME(e.target.value)}
              >
                <option value="">A/c Type</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>

            </div>

            {/* 7. DECLARATION */}
            <h3 className="font-semibold mt-6">7. Declaration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">

              <input
                className="border p-2"
                placeholder="Place"
                value={placeMSME}
                onChange={(e) => setPlaceMSME(e.target.value)}
              />

              <input
                type="date"
                className="border p-2"
                value={declarationDateMSME}
                onChange={(e) => setDeclarationDateMSME(e.target.value)}
              />

              <input
                className="border p-2 md:col-span-2"
                placeholder="Signature"
                value={signatureMSME}
                onChange={(e) => setSignatureMSME(e.target.value)}
              />

            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex justify-center mt-6">
              <button
                onClick={submitMSME}
                className="bg-green-600 text-white py-2 px-6 rounded"
              >
                Submit MSME Form
              </button>
            </div>

            {/* CLOSE BUTTON */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowMSMEForm(false)}
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ********* gst form *********** */}
      {showGSTForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[95%] md:w-[60%] p-6 rounded-lg max-h-[90%] overflow-y-auto">

            <h2 className="text-2xl font-bold mb-4 text-center">GST REGISTRATION – ONLINE MANDATORY INFORMATION FORM</h2>
            <p className="text-sm mb-4 text-gray-600">Please fill in CAPITAL letters. Only starred (*) fields are required online. Remaining details & supporting documents will be collected by our CA team.</p>

            {/* 1. BUSINESS DETAILS */}
            <h3 className="font-semibold mt-3">1. BUSINESS DETAILS</h3>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <input className="border p-2" placeholder="★ Legal Name of Business / Applicant (as per PAN)" />
              <input className="border p-2" placeholder="Trade Name (if different)" />
              <input className="border p-2" placeholder="★ Constitution of Business (Proprietor / Partnership / LLP / Pvt Ltd / Others)" />
              <input className="border p-2" placeholder="★ State & District (Principal Place of Business)" />
              <input className="border p-2" placeholder="★ Address – Principal Place of Business (Flat/Plot, Street, City, PIN)" />
              <input className="border p-2" placeholder="Nature of Premises (Own / Rented / Leased / Shared)" />
              <input className="border p-2" placeholder="Proposed Date of Commencement (Optional)" />
            </div>

            {/* 2. CONTACT DETAILS */}
            <h3 className="font-semibold mt-4">2. Contact Details</h3>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <input className="border p-2" placeholder="★ Mobile Number (OTP will be sent)" />
              <input className="border p-2" placeholder="★ Email Address (OTP will be sent)" />
            </div>

            {/* 3. BUSINESS ACTIVITY */}
            <h3 className="font-semibold mt-4">3. Business Activity</h3>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <input className="border p-2" placeholder="★ Nature of Business Activity (Wholesale / Retail / Services / Work Contract / Warehouse / Others)" />
              <input className="border p-2" placeholder="★ Top Goods – HSN 4-digit codes (Up to 5)" />
              <input className="border p-2" placeholder="Top Services – SAC 4-digit codes (If applicable)" />
              <input className="border p-2" placeholder="Annual Turnover Estimate (Optional)" />
            </div>

            {/* 4. PROMOTERS / PARTNERS */}
            <h3 className="font-semibold mt-4">4. Promoters / Partners / Directors</h3>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <input className="border p-2" placeholder="★ Name" />
              <input className="border p-2" placeholder="★ PAN" />
              <input className="border p-2" placeholder="★ Aadhaar" />
              <input className="border p-2" placeholder="★ Designation / Role" />
            </div>

            {/* 5. PRIMARY AUTHORISED SIGNATORY */}
            <h3 className="font-semibold mt-4">5. Primary Authorised Signatory</h3>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <input className="border p-2" placeholder="★ Name" />
              <input className="border p-2" placeholder="★ PAN" />
              <input className="border p-2" placeholder="★ Aadhaar" />
              <input className="border p-2" placeholder="★ Mobile Number" />
              <input className="border p-2" placeholder="★ Email Address" />
            </div>

            {/* 6. BANK DETAILS */}
            <h3 className="font-semibold mt-4">6. Bank Account Details</h3>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <input className="border p-2" placeholder="★ Bank Name & Branch" />
              <input className="border p-2" placeholder="★ IFSC Code" />
              <input className="border p-2" placeholder="★ Account Number" />
            </div>

            {/* DECLARATION */}
            <h3 className="font-semibold mt-6">Declaration</h3>
            <textarea
              className="border p-2 w-full"
              rows={4}
              defaultValue="I/We certify that the above information provided by me/us is true and correct to the best of my/our knowledge and agree to provide any additional documents or clarification requested by the CA team for GST Registration."
            />

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowGSTForm(false)} className="bg-red-500 text-white py-2 px-4 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
