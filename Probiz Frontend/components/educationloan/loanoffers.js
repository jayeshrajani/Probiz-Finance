import React, { useState } from "react";
import { PostRequest, PostRequestFormControl } from "../api-handler";
import swal from "sweetalert";
import { useRouter } from "next/router";
export default function LoanOffers() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  // Step 1: Personal Information
  const [fullName, setFullName] = useState("");
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");

  // Step 2: Course & Institution Details
  const [courseName, setCourseName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [courseDuration, setCourseDuration] = useState("");

  // Step 3: Expense Details
  const [totalFees, setTotalFees] = useState("");
  const [loanAmountRequired, setLoanAmountRequired] = useState("");

  // Step 4: Source of Income
  const [occupationOrBusiness, setOccupationOrBusiness] = useState("");
  const [monthlyOrAnnualIncome, setMonthlyOrAnnualIncome] = useState("");

  // Step 5: Co-Applicant Details
  const [coApplicantName, setCoApplicantName] = useState("");
  const [coApplicantFatherOrHusbandName, setCoApplicantFatherOrHusbandName] = useState("");
  const [coApplicantDateOfBirth, setCoApplicantDateOfBirth] = useState("");
  const [coApplicantRelationship, setCoApplicantRelationship] = useState("");
  const [coApplicantAddress, setCoApplicantAddress] = useState("");
  const [coApplicantContact, setCoApplicantContact] = useState("");
  const [coApplicantIncome, setCoApplicantIncome] = useState("");

  // Step 6 Collateral Details
  const [collateralType, setCollateralType] = useState("");
  const [collateralLocation, setCollateralLocation] = useState("");
  const [collateralMarketValue, setCollateralMarketValue] = useState("");

  // Step 7 Uploaded Documents
  const [admissionLetter, setAdmissionLetter] = useState(null);
  const [previousMarkSheets, setPreviousMarkSheets] = useState(null);
  const [feeStructure, setFeeStructure] = useState(null);
  const [profession, setProfession] = useState("")

  const nextStep = () => {
    // Validate Step 1 fields before proceeding
    if (step === 1) {
      if (
        !fullName.trim() ||
        !dateOfBirth.trim() ||
        !permanentAddress.trim()
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
    const formData = new FormData();
    setLoading(true);

    // Step 1: Personal Information
    formData.append("fullName", fullName);
    formData.append("fatherOrHusbandName", fatherOrHusbandName);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("permanentAddress", permanentAddress);
    formData.append("contactNumber", contactNumber);
    formData.append("email", email);

    // Step 2: Course & Institution Details
    formData.append("courseName", courseName);
    formData.append("institutionName", institutionName);
    formData.append("institutionAddress", institutionAddress);
    formData.append("admissionDate", admissionDate);
    formData.append("courseDuration", courseDuration);

    // Step 3: Loan Details
    formData.append("totalFees", totalFees);
    formData.append("loanAmountRequired", loanAmountRequired);

    // Step 4: Applicant Income
    // formData.append("occupationOrBusiness", occupationOrBusiness);
    formData.append("monthlyOrAnnualIncome", monthlyOrAnnualIncome);
    formData.append("profession", profession);

    // Step 5: Co-Applicant Information
    formData.append("coApplicantName", coApplicantName);
    formData.append("coApplicantFatherOrHusbandName", coApplicantFatherOrHusbandName);
    formData.append("coApplicantDateOfBirth", coApplicantDateOfBirth);
    formData.append("coApplicantRelationship", coApplicantRelationship);
    formData.append("coApplicantAddress", coApplicantAddress);
    formData.append("coApplicantContact", coApplicantContact);
    formData.append("coApplicantIncome", coApplicantIncome);

    // Step 6: Collateral Information
    formData.append("collateralType", collateralType);
    formData.append("collateralLocation", collateralLocation);
    formData.append("collateralMarketValue", collateralMarketValue);

    // Step 7: Document Uploads
    if (admissionLetter) formData.append("admissionLetter", admissionLetter);
    if (previousMarkSheets) formData.append("previousMarkSheets", previousMarkSheets);
    if (feeStructure) formData.append("feeStructure", feeStructure);

    try {
      const response = await PostRequestFormControl("addEducationLoan", formData);

      if (response.message === "Education loan application submitted successfully.") {
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
  const [businessCertificate, setBusinessCertificate] = useState("");
  const [showGumastaForm, setShowGumastaForm] = useState(false);
  const [showMSMEForm, setShowMSMEForm] = useState(false);
  // const [showGSTForm, setShowGSTForm] = useState(false);
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
        Unlock Best Education Loan Offers
      </h1>
      <p className="text-white text-base text-center mt-3">
        "Explore exclusive Kisan Credit Card offers with low-interest rates,
        flexible repayment options, and hassle-free access to agricultural
        financing!"
      </p>



      <div className="grid md:grid-cols-12 mt-10">
        <div className="col-span-6 px-5">
          <div className="flex justify-center mt-6">
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <span
                  key={num}
                  className={`w-12 h-12 flex items-center justify-center rounded-full font-semibold text-lg transition-all duration-300 shadow-md ${step === num
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
                  placeholder="Full Name"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={fatherOrHusbandName}
                  onChange={(e) => setFatherOrHusbandName(e.target.value)}
                  placeholder="Father/Husband Name"
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
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={maxDOB}
                    className="py-2 rounded px-5  w-full"
                  />
                </div>
              </div>
              <div className="flex justify-around">
                <input
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="Permanent Address"
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
                  placeholder="Contact Number"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex justify-around">
                <input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Course Name"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Institution Name"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={institutionAddress}
                  onChange={(e) => setInstitutionAddress(e.target.value)}
                  placeholder="Institution Address"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <div className="w-[60%] mt-5">
                  <label className="block text-white mb-2">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="py-2 rounded px-5 w-full"
                  />
                </div>
              </div>
              <div className="flex justify-around">
                <input
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  placeholder="Course Duration"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex justify-around">
                <input
                  value={totalFees}
                  onChange={(e) => setTotalFees(e.target.value)}
                  placeholder="Total Fees"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={loanAmountRequired}
                  onChange={(e) => setLoanAmountRequired(e.target.value)}
                  placeholder="Loan Amount Required"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              {/* <div className="flex justify-around">
                <input
                  value={occupationOrBusiness}
                  onChange={(e) => setOccupationOrBusiness(e.target.value)}
                  placeholder="Occupation / Business"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div> */}
              <div className="flex justify-around">
                <input
                  value={monthlyOrAnnualIncome}
                  onChange={(e) => setMonthlyOrAnnualIncome(e.target.value)}
                  placeholder="Monthly/Annual Income"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
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
            </>
          )}

          {step === 5 && (
            <>
              <div className="flex justify-around">
                <input
                  value={coApplicantName}
                  onChange={(e) => setCoApplicantName(e.target.value)}
                  placeholder="Co-Applicant Name"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={coApplicantFatherOrHusbandName}
                  onChange={(e) => setCoApplicantFatherOrHusbandName(e.target.value)}
                  placeholder="Co-Applicant Father/Husband Name"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <div className="w-[60%] mt-5">
                  <label className="block text-white mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={coApplicantDateOfBirth}
                    onChange={(e) => setCoApplicantDateOfBirth(e.target.value)}
                    className="py-2 rounded px-5 w-full "
                  />
                </div>
              </div>
              <div className="flex justify-around">
                <input
                  value={coApplicantRelationship}
                  onChange={(e) => setCoApplicantRelationship(e.target.value)}
                  placeholder="Relationship with Co-Applicant"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={coApplicantAddress}
                  onChange={(e) => setCoApplicantAddress(e.target.value)}
                  placeholder="Co-Applicant Address"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={coApplicantContact}

                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      setCoApplicantContact(input);
                    }
                  }}
                  placeholder="Co-Applicant Contact Number"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={coApplicantIncome}
                  onChange={(e) => setCoApplicantIncome(e.target.value)}
                  placeholder="Co-Applicant Income"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div className="flex justify-around">
                <input
                  value={collateralType}
                  onChange={(e) => setCollateralType(e.target.value)}
                  placeholder="Collateral Type"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={collateralLocation}
                  onChange={(e) => setCollateralLocation(e.target.value)}
                  placeholder="Collateral Location"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
              <div className="flex justify-around">
                <input
                  value={collateralMarketValue}
                  onChange={(e) => setCollateralMarketValue(e.target.value)}
                  placeholder="Collateral Market Value"
                  className="py-2 rounded px-5 w-[60%] mt-5"
                />
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <p className="text-white text-xl font-bold mt-5">Upload Required Documents:</p>

              <div className="flex justify-around">
                <input
                  type="file"
                  onChange={(e) => setAdmissionLetter(e.target.files[0])}
                  className="py-2 w-[60%] mt-3"
                />
              </div>
              <div className="flex justify-around">
                <input
                  type="file"
                  onChange={(e) => setPreviousMarkSheets(e.target.files[0])}
                  className="py-2 w-[60%] mt-3"
                />
              </div>
              <div className="flex justify-around">
                <input
                  type="file"
                  onChange={(e) => setFeeStructure(e.target.files[0])}
                  className="py-2 w-[60%] mt-3"
                />
              </div>
            </>
          )}


          <div className="flex justify-between mt-5">
            {step >= 1 && (
              <button onClick={prevStep} className="bg-gray-500 py-2 px-4 text-white rounded">
                Back
              </button>
            )}
            {step < 7 ? (
              <button onClick={nextStep} className="bg-[#4c1f7a] py-2 px-4 text-white rounded">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="bg-green-600 py-2 px-4 text-white rounded">
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </div>
        <div className="col-span-6 flex justify-center ">
          <img
            src="/images/Education Loan.png"
            alt="loan offer"
            className="max-w-full h-[75%] rounded-2xl"
          />
        </div>
      </div>
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
    </section>
    
  );
}
