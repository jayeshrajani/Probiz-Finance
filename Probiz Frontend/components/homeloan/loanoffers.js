import React, { useState, useEffect } from "react";
import { PostRequest, PostRequestFormControl, runCibilPdfDownloadFromApiResponse } from "../api-handler";
import swal from "sweetalert";
import { useRouter } from "next/router";

/** Login stores either the user document or `{ data: user }` depending on client version. */
function parseStoredUserProfile() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.data && typeof parsed.data === "object") {
      const inner = parsed.data;
      if (
        inner.user_Email != null ||
        inner.mobile_no != null ||
        inner.user_Name != null
      ) {
        return inner;
      }
    }
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function digitsMobile10(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 10);
}

export default function LoanOffers() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  // Step 1: Personal Information
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact, setAlternateContact] = useState("");

  // Step 2: Property Details
  const [propertyType, setPropertyType] = useState("");
  const [propertySize, setPropertySize] = useState("");
  const [constructionSize, setConstructionSize] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [loanAmount, setLoanAmount] = useState("");

  // Step 3: Income Details
  const [profession, setProfession] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [incomeTaxReturn, setIncomeTaxReturn] = useState("");
  const [businessCertificate, setBusinessCertificate] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [cibilCheckLoading, setCibilCheckLoading] = useState(false);
  const [cibilPanForDownload, setCibilPanForDownload] = useState("")
  const [cibilPdfLoading, setCibilPdfLoading] = useState(false)
  const [cibilScoreFetched, setCibilScoreFetched] = useState(false)

  // Step 4: Document Uploads
  const [aadharFront, setAadharFront] = useState("");
  const [aadharBack, setAadharBack] = useState("");
  const [panCard, setPanCard] = useState("");
  const [electricityBill, setElectricityBill] = useState("");
  const [propertyFront, setPropertyFront] = useState("");
  const [propertyInside, setPropertyInside] = useState("");
  const [propertyTaxReceipt, setPropertyTaxReceipt] = useState("");

  // Step 5: Additional Document Uploads
  const [bankStatement, setBankStatement] = useState("");
  const [incomeTaxReturnFile, setIncomeTaxReturnFile] = useState("");
  const [salarySlipOrOfferLetter, setSalarySlipOrOfferLetter] = useState("");
  const [forBusiness, setforBusiness] = useState("");
  const [propertyPaper, setPropertyPaper] = useState("");

  const [showItrForm, setShowItrForm] = useState(false);
  const [showGumastaForm, setShowGumastaForm] = useState(false);
  const [showMSMEForm, setShowMSMEForm] = useState(false);
  const [showGSTForm, setShowGSTForm] = useState(false);

  /** When URL is /homeloan#cibil-check-pdf, show only PAN check + paid PDF (no full home-loan wizard). */
  const [cibilPdfDeepLink, setCibilPdfDeepLink] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const hash = (router.asPath.split("#")[1] || "").trim();
    const isCibilOnly = hash === "cibil-check-pdf";
    setCibilPdfDeepLink(isCibilOnly);
    if (isCibilOnly) setStep(3);
  }, [router.isReady, router.asPath]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash?.replace(/^#/, "").trim();
      const isCibilOnly = hash === "cibil-check-pdf";
      setCibilPdfDeepLink(isCibilOnly);
      if (isCibilOnly) setStep(3);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const fieldClass =
    "w-full rounded-lg border border-white/35 bg-white py-2.5 px-4 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
  const labelClass = "mb-1.5 block text-sm font-medium text-white/95"
  const fileFieldClass =
    "mt-1 block w-full cursor-pointer rounded-lg border border-white/35 bg-white py-2 pl-3 pr-3 text-sm text-gray-800 shadow-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-orange-100"

  const nextStep = () => {
    // Validate Step 1 fields before proceeding
    if (step === 1) {
      if (!fullName.trim() || !dob.trim() || !address.trim()) {
        // alert("Please fill all required fields correctly before proceeding.");
        swal({
          icon: "warning",
          title: "Please Try Again",
          text: "Please fill all required fields correctly before proceeding.",
        });
        return;
      }

      if (!contactNumber.trim() || contactNumber.length < 10) {
        // alert("Contact number must be at least 10 digits.");
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

    const profile = parseStoredUserProfile()
    const email = profile.user_Email || profile.email

    const name =
      (fullName && String(fullName).trim()) ||
      (profile.user_Name && String(profile.user_Name).trim()) ||
      (profile.name && String(profile.name).trim()) ||
      ""

    const mobile_no = digitsMobile10(contactNumber || profile.mobile_no || "")

    if (!email) {
      swal({
        icon: "warning",
        title: "Sign in required",
        text: "Please sign in so we can use your registered profile (name, email, mobile) for the CIBIL check.",
      })
      return
    }

    if (!name) {
      swal({
        icon: "warning",
        title: "Name missing",
        text: "Your account has no name on file. Please sign in with a complete profile or use the full home loan application.",
      })
      return
    }

    if (mobile_no.length !== 10) {
      swal({
        icon: "warning",
        title: "Mobile number required",
        text: "We need a 10-digit mobile number from your account or the home loan form. Please sign in with a registered mobile or complete step 1 of the application.",
      })
      return
    }

    setCibilPanForDownload(panValue)
    setCibilCheckLoading(true)
    try {
      const res = await PostRequest("checkCreditScore", {
        name,
        email,
        mobile_no,
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

    const profile = parseStoredUserProfile()
    const email = profile.user_Email || profile.email
    const name =
      (fullName && String(fullName).trim()) ||
      (profile.user_Name && String(profile.user_Name).trim()) ||
      (profile.name && String(profile.name).trim()) ||
      ""
    const mobile_no = digitsMobile10(contactNumber || profile.mobile_no || "")

    if (!email || !name || mobile_no.length !== 10) {
      swal({
        icon: "warning",
        title: "Profile incomplete",
        text: "Please sign in with a complete account (name, email, 10-digit mobile) to download the PDF, or use the full home loan application.",
      })
      return
    }

    setCibilPdfLoading(true)
    try {
      const res = await PostRequest("checkCreditScorePdf", {
        name,
        email,
        mobile_no,
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

    // Personal Information
    formData.append("fullName", fullName);
    formData.append("dateOfBirth", dob);
    formData.append("address", address);
    formData.append("contactNumber", contactNumber);
    formData.append("alternateContact", alternateContact);

    // Property Details
    formData.append("propertyType", propertyType);
    formData.append("propertySize", propertySize);
    formData.append("constructionSize", constructionSize);
    formData.append("marketValue", marketValue);
    formData.append("loanAmount", loanAmount);

    // Income Details
    formData.append("profession", profession);
    formData.append("incomeType", incomeType);
    formData.append("monthlyIncome", monthlyIncome);
    formData.append("incomeTaxReturn", incomeTaxReturn);
    formData.append("businessCertificate", businessCertificate);
    formData.append("cibilScore", cibilScore);

    // Step 4: Document Uploads
    formData.append("aadharFront", aadharFront);
    formData.append("aadharBack", aadharBack);
    formData.append("panCard", panCard);
    formData.append("electricityBill", electricityBill);
    formData.append("propertyFront", propertyFront);
    formData.append("propertyInside", propertyInside);
    formData.append("propertyTaxReceipt", propertyTaxReceipt);

    // Step 5: Additional Document Uploads
    formData.append("bankStatement", bankStatement);
    formData.append("incomeTaxReturnFile", incomeTaxReturnFile);
    formData.append("salarySlipOrOfferLetter", salarySlipOrOfferLetter);
    formData.append("forBusiness", forBusiness);
    formData.append("propertyPaper", propertyPaper);



    try {
      const response = await PostRequestFormControl(
        "loanOfferDetail",
        formData
      );
      console.log("loan offer detail response", response);

      if (response.message === "Loan details submitted successfully") {
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

  // ******** itr form api **************
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
    console.log("user id is --->", userId)
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

    try {
      const res = await PostRequest(
        "submitITRInformation",
        payload
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
    <section className="mt-10 bg-[#FF7F00] py-10 md:py-14 md:px-8 lg:px-12">
      <h1 className="mb-6 px-4 text-center text-3xl font-bold leading-tight text-white md:mb-10 md:text-4xl">
        {cibilPdfDeepLink
          ? "Check your CIBIL score"
          : "Unlock Best Home Loan Offers"}
      </h1>
      {cibilPdfDeepLink && (
        <p className="mx-auto mb-8 max-w-xl px-4 text-center text-base text-white/95 md:text-lg">
          Enter your PAN to view your score. After a successful check, you can
          download the official credit report PDF (₹99).
        </p>
      )}

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12 lg:gap-14">
        <div
          className={
            cibilPdfDeepLink ? "md:col-span-12" : "md:col-span-6"
          }
        >
          <div className="mx-auto w-full max-w-lg px-4 sm:px-0">
          {!cibilPdfDeepLink && (
          <div className="mb-8 flex justify-center">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold shadow-md transition-all duration-300 sm:h-12 sm:w-12 sm:text-lg
          ${step === num
                      ? "scale-105 bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-2 ring-white/40"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
          )}
          {step === 1 && (
            <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="homeloan-fullName" className={labelClass}>
                    Full name (as per Aadhaar)
                  </label>
                  <input
                    id="homeloan-fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name (As per Aadhaar)"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="homeloan-dob" className={labelClass}>
                    Date of birth (as per Aadhaar)
                  </label>
                  <input
                    id="homeloan-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={maxDOB}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="homeloan-address" className={labelClass}>
                    Address (as per Aadhaar)
                  </label>
                  <input
                    id="homeloan-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address (As per Aadhaar)"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="homeloan-contact" className={labelClass}>
                    Contact number (linked with Aadhaar)
                  </label>
                  <input
                    id="homeloan-contact"
                    value={contactNumber}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (/^\d{0,10}$/.test(input)) {
                        setContactNumber(input);
                      }
                    }}
                    placeholder="10-digit mobile number"
                    className={fieldClass}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label htmlFor="homeloan-alt" className={labelClass}>
                    Alternate contact (optional)
                  </label>
                  <input
                    id="homeloan-alt"
                    value={alternateContact}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (/^\d{0,10}$/.test(input)) {
                        setAlternateContact(input);
                      }
                    }}
                    placeholder="Alternate contact number"
                    className={fieldClass}
                    inputMode="numeric"
                  />
                </div>
            </div>
          )}
          {step === 2 && (
            <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="homeloan-propertyType" className={labelClass}>
                    Property type
                  </label>
                  <select
                    id="homeloan-propertyType"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className={fieldClass}
                  >
                    <option>Property Type</option>
                    <option>Plot</option>
                    <option>Under Construction</option>
                    <option>Ready to Move</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="homeloan-propertySize" className={labelClass}>
                    Property size (sq. ft.)
                  </label>
                  <input
                    id="homeloan-propertySize"
                    value={propertySize}
                    onChange={(e) => setPropertySize(e.target.value)}
                    placeholder="Property Size (Total Square Feet)"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="homeloan-construction" className={labelClass}>
                    Construction area (sq. ft.)
                  </label>
                  <input
                    id="homeloan-construction"
                    value={constructionSize}
                    onChange={(e) => setConstructionSize(e.target.value)}
                    placeholder="Construction (Total Square Feet)"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="homeloan-market" className={labelClass}>
                    Property market value
                  </label>
                  <input
                    id="homeloan-market"
                    value={marketValue}
                    onChange={(e) => setMarketValue(e.target.value)}
                    placeholder="Property Market Value"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="homeloan-loanAmt" className={labelClass}>
                    Loan amount required
                  </label>
                  <input
                    id="homeloan-loanAmt"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="Loan Amount Required"
                    className={fieldClass}
                  />
                </div>
            </div>
          )}
          {step === 3 && !cibilPdfDeepLink && (
            <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="homeloan-profession" className={labelClass}>
                    Profession
                  </label>
                  <select
                    id="homeloan-profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className={fieldClass}
                  >
                    <option>Profession</option>
                    <option>Job</option>
                    <option>Business</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="homeloan-incomeType" className={labelClass}>
                    Income type
                  </label>
                  <select
                    id="homeloan-incomeType"
                    value={incomeType}
                    onChange={(e) => setIncomeType(e.target.value)}
                    className={fieldClass}
                  >
                    <option>Income Type</option>
                    <option>Cash</option>
                    <option>Account</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="homeloan-monthlyIncome" className={labelClass}>
                    Total monthly income
                  </label>
                  <input
                    id="homeloan-monthlyIncome"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="Total Monthly Income"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="homeloan-itr" className={labelClass}>
                    Income tax return filed?
                  </label>
                  <select
                    id="homeloan-itr"
                    value={incomeTaxReturn}
                    onChange={(e) => {
                      setIncomeTaxReturn(e.target.value);
                      if (e.target.value === "No") {
                        setShowItrForm(false);
                      }
                    }}
                    className={fieldClass}
                  >
                    <option>Income Tax Return</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              {incomeTaxReturn === "No" && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowItrForm(true)}
                    className="rounded-lg bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/25"
                  >
                    Apply now (Fill ITR form)
                  </button>
                </div>
              )}
              {profession === "Business" && (
                <div>
                  <label htmlFor="homeloan-bizCert" className={labelClass}>
                    Business certificate
                  </label>
                  <select
                    id="homeloan-bizCert"
                    value={businessCertificate}
                    onChange={(e) => setBusinessCertificate(e.target.value)}
                    className={fieldClass}
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
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowGumastaForm(true)}
                    className="text-sm font-semibold text-white underline decoration-2 underline-offset-4 hover:text-white/90"
                  >
                    Apply now (Gumasta license)
                  </button>
                </div>
              )}

              {businessCertificate === "MSME" && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowMSMEForm(true)}
                    className="text-sm font-semibold text-white underline decoration-2 underline-offset-4 hover:text-white/90"
                  >
                    Apply now (MSME registration)
                  </button>
                </div>
              )}
              {businessCertificate === "Gst Number" && (
                <div className="flex justify-center text-center">
                  <button
                    type="button"
                    onClick={() => setShowGSTForm(true)}
                    className="text-sm font-semibold text-white underline decoration-2 underline-offset-4 hover:text-white/90"
                  >
                    Apply now (GST form)
                  </button>
                </div>
              )}

            </div>
          )}
          {step === 3 && (
              <div
                id="cibil-check-pdf"
                className="scroll-mt-28 rounded-xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm sm:mt-2 sm:p-5 sm:scroll-mt-32"
              >
                <label htmlFor="homeloan-cibil-pan" className={labelClass}>
                  PAN (for CIBIL score check)
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                  <input
                    id="homeloan-cibil-pan"
                    value={cibilScore}
                    onChange={(e) =>
                      setCibilScore(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. ABCDE1234F"
                    autoComplete="off"
                    className={`${fieldClass} min-w-0 flex-1`}
                  />
                  <button
                    type="button"
                    aria-label="Check CIBIL score"
                    onClick={handleCheckCibilScore}
                    disabled={cibilCheckLoading}
                    className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:h-auto sm:min-w-[9.5rem]"
                  >
                    {cibilCheckLoading ? "Checking..." : "Check now"}
                  </button>
                </div>
                {cibilScoreFetched && (
                  <button
                    type="button"
                    aria-label="Download CIBIL PDF"
                    onClick={handleDownloadCibilPdf}
                    disabled={cibilPdfLoading}
                    className="mt-4 w-full rounded-lg bg-[#4C1F7A] py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#3d195f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
                  >
                    {cibilPdfLoading
                      ? "Downloading..."
                      : "Download CIBIL PDF (₹99)"}
                  </button>
                )}
              </div>
          )}
          {step === 4 && (
            <div className="mt-2 space-y-4">
              <p className="text-lg font-bold text-white sm:text-xl">
                Upload required documents
              </p>

              <label className={labelClass}>
                Aadhaar front
              </label>
              <input
                type="file"
                name="aadharFront"
                className={fileFieldClass}
                onChange={(e) => setAadharFront(e.target.files[0])}
              />

              <label className={labelClass}>
                Aadhaar back
              </label>
              <input
                type="file"
                name="aadharBack"
                className={fileFieldClass}
                onChange={(e) => setAadharBack(e.target.files[0])}
              />

              <label className={labelClass}>
                PAN card
              </label>
              <input
                type="file"
                name="panCard"
                className={fileFieldClass}
                onChange={(e) => setPanCard(e.target.files[0])}
              />

              <label className={labelClass}>
                Electricity bill / rent agreement
              </label>
              <input
                type="file"
                name="electricityBill"
                className={fileFieldClass}
                onChange={(e) => setElectricityBill(e.target.files[0])}
              />

              <label className={labelClass}>
                Property photo (front)
              </label>
              <input
                type="file"
                name="propertyFront"
                className={fileFieldClass}
                onChange={(e) => setPropertyFront(e.target.files[0])}
              />

              <label className={labelClass}>
                Property photo (inside)
              </label>
              <input
                type="file"
                name="propertyInside"
                className={fileFieldClass}
                onChange={(e) => setPropertyInside(e.target.files[0])}
              />

              <label className={labelClass}>
                Property tax receipt
              </label>
              <input
                type="file"
                name="propertyTaxReceipt"
                className={fileFieldClass}
                onChange={(e) => setPropertyTaxReceipt(e.target.files[0])}
              />
            </div>
          )}
          {step === 5 && (
            <div className="mt-2 space-y-4">
              <p className="text-lg font-bold text-white sm:text-xl">
                Upload additional documents
              </p>

              <label className={labelClass}>
                Bank statement
              </label>
              <input
                type="file"
                className={fileFieldClass}
                onChange={(e) => setBankStatement(e.target.files[0])}
              />

              <label className={labelClass}>
                Income tax return file (if available)
              </label>
              <input
                type="file"
                className={fileFieldClass}
                onChange={(e) => setIncomeTaxReturnFile(e.target.files[0])}
              />
              {profession === "Job" ? (
                <>
                  <label className={labelClass}>
                    Salary slip or offer letter
                  </label>
                  <input
                    type="file"
                    className={fileFieldClass}
                    onChange={(e) =>
                      setSalarySlipOrOfferLetter(e.target.files[0])
                    }
                  />
                </>
              ) : (
                <>
                  <label className={labelClass}>
                    Gumasta, MSME, Nagar Nigam, others
                  </label>
                  <input
                    type="file"
                    className={fileFieldClass}
                    onChange={(e) => setforBusiness(e.target.files[0])}
                  />
                </>
              )}

              <label className={labelClass}>
                Property paper
              </label>
              <input
                type="file"
                className={fileFieldClass}
                onChange={(e) => setPropertyPaper(e.target.files[0])}
              />
            </div>
          )}

          {!cibilPdfDeepLink && (
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 sm:min-w-[7rem]"
              >
                Back
              </button>
            ) : (
              <span className="hidden sm:block sm:w-[7rem]" aria-hidden="true" />
            )}
            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#4C1F7A] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-[#3d195f] sm:ml-auto sm:min-w-[7rem]"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-green-600 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-green-700 sm:ml-auto"
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
          )}
          {cibilPdfDeepLink && (
            <p className="mt-8 border-t border-white/25 pt-6 text-center">
              <a
                href="/homeloan"
                className="text-sm font-semibold text-white underline decoration-2 underline-offset-4 hover:text-white/90"
              >
                Continue with full home loan application
              </a>
            </p>
          )}
          </div>
        </div>
        {!cibilPdfDeepLink && (
        <div className="flex justify-center md:col-span-6 md:sticky md:top-28 md:self-start">
          <img
            src="/images/Home Loan.webp"
            alt="Home loan illustration"
            className="h-auto max-h-[min(520px,70vh)] w-full max-w-md rounded-2xl object-contain shadow-xl ring-1 ring-black/10 md:max-w-lg"
          />
        </div>
        )}
      </div>

      {/* ******** itr form ************* */}
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
