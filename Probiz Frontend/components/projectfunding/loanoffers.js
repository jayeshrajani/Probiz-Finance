import React, { useState } from "react";
import { PostRequestFormControl } from "../api-handler";
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


  const [loanAmount, setLoanAmount] = useState("");

  // Step 3: Income Details

  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [incomeTaxReturn, setIncomeTaxReturn] = useState("");
  const [cibilScore, setCibilScore] = useState("");

  // Step 4: Document Uploads
  const [aadharFront, setAadharFront] = useState("");
  const [aadharBack, setAadharBack] = useState("");
  const [panCard, setPanCard] = useState("");
  const [electricityBill, setElectricityBill] = useState("");

  // Step 5: Additional Document Uploads
  const [bankStatement, setBankStatement] = useState("");
  const [incomeTaxReturnFile, setIncomeTaxReturnFile] = useState("");

  const [forBusiness, setforBusiness] = useState("");
  const [showItrForm, setShowItrForm] = useState(false);
  const [profession, setProfession] = useState("");
  const [businessCertificate, setBusinessCertificate] = useState("");

  const nextStep = () => {
    // Validate Step 1 fields before proceeding
    if (step === 1) {
      if (
        !fullName.trim() ||
        !dob.trim() ||
        !address.trim()
      ) {
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

    // Add similar validation for other steps if needed
    setStep(step + 1);
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

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

    formData.append("fullName", fullName);
    formData.append("dateOfBirth", dob);
    formData.append("address", address);
    formData.append("contactNumber", contactNumber);
    formData.append("alternateContactNumber", alternateContact);
    formData.append("businessName", companyname); // Assuming this is intended as businessName
    formData.append("profession", profession);

    formData.append("loanAmountRequired", loanAmount);
    formData.append("incomeType", incomeType);
    formData.append("totalMonthlyIncome", monthlyIncome);
    formData.append("incomeTaxReturn", incomeTaxReturn);
    formData.append("cibilScore", cibilScore);
    formData.append("businessCertificate", businessCertificate);

    if (aadharFront) formData.append("aadharFront", aadharFront);
    if (aadharBack) formData.append("aadharBack", aadharBack);
    if (panCard) formData.append("panCard", panCard);
    if (electricityBill) formData.append("electricityBillOrRentAgreement", electricityBill);
    if (bankStatement) formData.append("bankStatement", bankStatement);
    if (incomeTaxReturnFile) formData.append("incomeTaxReturnFile", incomeTaxReturnFile);
    if (forBusiness) formData.append("businessDocuments", forBusiness);


    try {
      const response = await PostRequestFormControl("projectfundingLoanDetail", formData);
      //  console.log("response",response);

      if (response.message === "Application submitted successfully") {
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
  const [showGumastaForm, setShowGumastaForm] = useState(false);
  const [showMSMEForm, setShowMSMEForm] = useState(false);

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
    <>
      <section className="bg-[#FF7F00] py-10 md:px-12  mt-10">
        <h1 className="text-white text-4xl text-center">
          Unlock Best Project Funding by Government Banks Offers
        </h1>

        <div className="grid md:grid-cols-12">
          <div className="col-span-6 px-5">
            <div className="flex justify-center mt-6">
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span
                    key={num}
                    className={`w-12 h-12 flex items-center justify-center rounded-full font-semibold text-lg transition-all duration-300 shadow-md 
            ${step === num
                        ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/50"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 1 */}
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

            {/* Step 2 */}
            {step === 2 && (
              <>
                <div className="flex justify-around">
                  <input
                    value={companyname}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="py-2 rounded px-5 w-[60%] mt-5"
                  />
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

            {/* Step 3 */}
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

              </>






            )}




            {/* Step 4 */}
            {step === 4 && (
              <>
                <p className="text-white text-xl font-bold mt-5">
                  Upload Required Documents:
                </p>
                <label className="text-white block mt-3 font-semibold">Aadhar Front</label>
                <input
                  type="file"
                  name="aadharFront"
                  className="py-2 w-full mt-2"
                  onChange={(e) => setAadharFront(e.target.files[0])}
                />

                <label className="text-white block mt-3 font-semibold">Aadhar Back Side</label>
                <input
                  type="file"
                  name="aadharBack"
                  className="py-2 w-full mt-2"
                  onChange={(e) => setAadharBack(e.target.files[0])}
                />

                <label className="text-white block mt-3 font-semibold">PAN Card</label>
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

            {/* Step 5 */}
            {step === 5 && (
              <>
                <p className="text-white text-xl font-bold mt-5">
                  Upload Additional Documents:
                </p>
                <label className="text-white block mt-3 font-semibold">Bank Statement</label>
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

            {/* Navigation Buttons */}
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
                <button
                  className="bg-green-600 py-2 px-4 text-white rounded"
                  onClick={handleSubmit}
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
          <div className="cols col-span-6">
            <img src="/images/Project Funding.png" alt="loan offer" />
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

          {/* ********* gumasta form ********** */}
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


          {/* ********** msme form ********** */}
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

        </div>
      </section>
    </>
  );
}
