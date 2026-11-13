import axios from "axios";

/** Live API (used whenever the app is not opened on localhost). */
const PRODUCTION_API_BASE = "https://probizfinance.com/api/";

const normalizeApiBase = (url) => (url.endsWith("/") ? url : `${url}/`);

/**
 * API base for browser requests. Resolves at runtime so one static export works on probizfinance.com
 * and on local dev; avoids baking `NEXT_PUBLIC_API_URL` from .env.local into production builds.
 * Local: set `NEXT_PUBLIC_API_URL` in `.env.local` (Express port, not Next.js).
 * Production override: optional `NEXT_PUBLIC_API_URL_PRODUCTION`.
 */
const getServerUrl = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      const local =
        (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
        "http://localhost/api/";
      return normalizeApiBase(local);
    }
  }
  const prod =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL_PRODUCTION) ||
    PRODUCTION_API_BASE;
  return normalizeApiBase(prod);
};

/**
 * Cashfree JS SDK mode must match the backend env (sandbox.cashfree.com vs api.cashfree.com + keys).
 * Resolves at runtime so a prod build is not stuck on sandbox from `.env.local` (fixes payment_session_id_invalid on live).
 * Localhost: `NEXT_PUBLIC_CASHFREE_MODE` (default sandbox). Deployed: `NEXT_PUBLIC_CASHFREE_MODE_PRODUCTION` or production.
 */
const getCashfreeMode = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      const raw =
        (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CASHFREE_MODE) ||
        "sandbox";
      return raw === "production" ? "production" : "sandbox";
    }
  }
  const prodRaw =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CASHFREE_MODE_PRODUCTION) ||
    "production";
  return prodRaw === "production" ? "production" : "sandbox";
};
/** INR fee for paid form flows (ITR, MSME, Gumasta). */
const PAID_FORM_SUBMISSION_FEE = 100;
const ITR_FORM_FEE = PAID_FORM_SUBMISSION_FEE;
const CREDIT_SCORE_PDF_FEE = 99

const networkFailurePayload = (error) => {
  const msg = error?.message || String(error);
  const isFetchFailed =
    msg === "Failed to fetch" ||
    msg.includes("NetworkError") ||
    msg.includes("network");
  return {
    status: 0,
    message: isFetchFailed
      ? `Cannot reach API at ${getServerUrl()} (${msg}). On localhost: start the Node backend and match NEXT_PUBLIC_API_URL in .env.local, then restart next dev.`
      : msg,
    _networkError: true,
  };
};

/**
 * Parses fetch response body as JSON. If the server returns HTML (404 page, proxy error),
 * returns a plain object instead of throwing (avoids Next.js "Unexpected token '<'" crash).
 * @param {Response} result
 * @returns {Promise<object>}
 */
const parseFetchJson = async (result) => {
  const text = await result.text();
  const trimmed = text.trim();
  if (!trimmed) {
    return { status: result.status, message: "Empty response from server" };
  }
  if (trimmed.startsWith("<") || trimmed.startsWith("<!")) {
    return {
      status: result.status,
      message:
        result.status === 404
          ? "API not found (404). If Next.js runs on port 3000, do not set NEXT_PUBLIC_API_URL to the same port — run Express on another port (e.g. 4000 with PORT=4000 in backend .env), set NEXT_PUBLIC_API_URL=http://localhost:4000/api/, restart `next dev` and `node index.js`. Deploy Cashfree routes to production when going live."
          : `Server returned HTML instead of JSON (HTTP ${result.status}). Check API base URL and that the backend is running.`,
      _nonJsonResponse: true,
    };
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      status: result.status,
      message: "Invalid JSON from server",
      _nonJsonResponse: true,
      rawPreview: trimmed.slice(0, 120),
    };
  }
};

const loadCashfreeSdk = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Window is not available"));
    if (window.Cashfree) return resolve(window.Cashfree);

    const existingScript = document.querySelector('script[data-cashfree-sdk="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.Cashfree));
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Cashfree SDK")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.dataset.cashfreeSdk = "true";
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.body.appendChild(script);
  });
};

const hasSuccessfulPayment = async (orderId) => {
  try {
    const [orderRes, paymentsRes] = await Promise.all([
      GetRequestwithoutAuth(`cashfree/getOrder/${orderId}`),
      GetRequestwithoutAuth(`cashfree/getPayments/${orderId}`),
    ]);

    const orderPaid = orderRes?.data?.order_status === "PAID";
    const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : [];
    const paymentSuccess = payments.some((item) => item?.payment_status === "SUCCESS");
    return orderPaid || paymentSuccess;
  } catch (error) {
    console.error("Error validating payment status:", error);
    return false;
  }
};

/**
 * Opens Cashfree checkout for a paid form submission (ITR / MSME / Gumasta).
 * @param {{ purpose: string, orderIdPrefix: string, orderNote: string, notPaidMessage: string, customerName?: string, customerEmail?: string, customerPhone?: string }} opts
 * @returns {Promise<{ ok: true } | { ok: false, response: object }>}
 */
const payCashfreeBeforeSubmit = async (opts) => {
  const {
    purpose,
    orderIdPrefix,
    orderNote,
    notPaidMessage,
    orderAmount = PAID_FORM_SUBMISSION_FEE,
    customerName,
    customerEmail,
    customerPhone,
  } = opts;

  const userData = userDataProvider() || {};
  const name =
    customerName ||
    userData?.user_Name ||
    userData?.name ||
    "Customer";
  const email = customerEmail || userData?.user_Email || "no-reply@example.com";
  const phone = customerPhone || userData?.mobile_no || "9999999999";
  const customerId = String(userData?._id || userData?.id || `CUST_${Date.now()}`);
  const orderId = `${orderIdPrefix}_${Date.now()}`;

  const createOrderPayload = {
    orderId,
    orderAmount,
    orderCurrency: "INR",
    customerId,
    customerName: name,
    customerEmail: email,
    customerPhone: String(phone).replace(/\D/g, "").slice(0, 10) || "9999999999",
    purpose,
    orderNote,
    returnUrl: typeof window !== "undefined" ? `${window.location.origin}/home` : undefined,
  };

  const orderRes = await PostRequest("cashfree/createOrder", createOrderPayload);

  if (orderRes?._networkError) {
    return {
      ok: false,
      response: {
        status: 0,
        message: orderRes.message,
      },
    };
  }

  if (orderRes?._nonJsonResponse) {
    return {
      ok: false,
      response: {
        status: orderRes.status || 502,
        message: orderRes.message || "Payment API error — check NEXT_PUBLIC_API_URL and backend Cashfree routes.",
      },
    };
  }

  const d = orderRes?.data && typeof orderRes.data === "object" ? orderRes.data : {};
  const paymentSessionId = d.payment_session_id || d.paymentSessionId || "";

  if (!paymentSessionId) {
    const hint =
      d?.message || d?.code
        ? ` (${[d.code, typeof d.message === "string" ? d.message : ""].filter(Boolean).join(" — ")})`
        : "";
    const combined = [orderRes?.message, orderRes?.error]
      .filter((x) => x != null && String(x).trim() !== "")
      .join(" — ");
    return {
      ok: false,
      response: {
        status: typeof orderRes?.status === "number" ? orderRes.status : 400,
        message:
          combined ||
          `Unable to create payment order${hint}`,
      },
    };
  }

  const Cashfree = await loadCashfreeSdk();
  const cashfree = Cashfree({ mode: getCashfreeMode() });

  try {
    await cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_modal",
    });
  } catch (checkoutErr) {
    const raw = checkoutErr?.message || String(checkoutErr);
    const lower = raw.toLowerCase();
    if (
      lower.includes("payment_session") ||
      lower.includes("session_id") ||
      lower.includes("request_failed")
    ) {
      return {
        ok: false,
        response: {
          status: 400,
          message: `${raw} — SDK mode was "${getCashfreeMode()}". It must match the server: sandbox + sandbox.cashfree.com + test keys, or production + api.cashfree.com + live keys. Local: set NEXT_PUBLIC_CASHFREE_MODE in .env.local; staging: set NEXT_PUBLIC_CASHFREE_MODE_PRODUCTION.`,
        },
      };
    }
    return {
      ok: false,
      response: {
        status: 400,
        message: raw || "Cashfree checkout failed",
      },
    };
  }

  const success = await hasSuccessfulPayment(orderId);
  if (!success) {
    return {
      ok: false,
      response: {
        status: 402,
        message: notPaidMessage,
      },
    };
  }

  return { ok: true };
};

const payForItrBeforeSubmit = (requestBody) =>
  payCashfreeBeforeSubmit({
    purpose: "itr",
    orderIdPrefix: "ITR",
    orderNote: "ITR form submission fee",
    notPaidMessage: "Payment not completed. Please complete payment to submit the ITR form.",
    customerName:
      requestBody?.fullName ||
      requestBody?.nameOfIndividualOrFirm,
    customerEmail: requestBody?.email,
    customerPhone: requestBody?.mobile,
  });

const payForMsmeBeforeSubmit = (requestBody) =>
  payCashfreeBeforeSubmit({
    purpose: "msme",
    orderIdPrefix: "MSME",
    orderNote: "MSME registration form submission fee",
    notPaidMessage: "Payment not completed. Please complete payment to submit the MSME registration form.",
    customerName: requestBody?.nameOnAadhaar || requestBody?.enterpriseName,
    customerEmail: requestBody?.email,
    customerPhone: requestBody?.mobileLinkedToAadhaar,
  });

const payForGumastaBeforeSubmit = (requestBody) =>
  payCashfreeBeforeSubmit({
    purpose: "gumasta",
    orderIdPrefix: "GUM",
    orderNote: "Gumasta license form submission fee",
    notPaidMessage: "Payment not completed. Please complete payment to submit the Gumasta license form.",
    customerName: requestBody?.applicantAuthorizedPersonName,
    customerEmail: requestBody?.emailId,
    customerPhone: requestBody?.mobileNo,
  });

// Paid credit score PDF download (₹99)
const payForCreditScorePdfBeforeDownload = (requestBody) =>
  payCashfreeBeforeSubmit({
    purpose: "general",
    orderIdPrefix: "CREDITPDF",
    orderNote: "Credit score PDF download fee",
    notPaidMessage:
      "Payment not completed. Please complete payment to download the credit score PDF.",
    orderAmount: CREDIT_SCORE_PDF_FEE,
    customerName: requestBody?.name,
    customerEmail: requestBody?.email,
    customerPhone: requestBody?.mobile_no,
  })

let userDataProvider = () => {
  if (process.browser) {
    const GetUserData = localStorage.getItem(
      "userData"
    );
    if (GetUserData !== null) {
      const UserData = JSON.parse(GetUserData);
      const data = UserData;
      return data;
    }
  }
};

let GetRequestwithoutAuth = async (endPoint) => {
  try {
  let result = await fetch(getServerUrl() + endPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
    return parseFetchJson(result);
  } catch (error) {
    console.error("GetRequestwithoutAuth:", error);
    return networkFailurePayload(error);
  }
};

export const getApihandler = async (endPoint) => {
  try {
    const getres = await axios.get(getServerUrl() + endPoint);
    return getres.data;
  } catch (error) {
    return { error };
  }
};

let PutRequest = async (endPoint, requestBody) => {
  try {
    let result = await fetch(getServerUrl() + endPoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    return parseFetchJson(result);
  } catch (error) {
    console.error("Error in API call:", error);
    return networkFailurePayload(error);
  }
};

/**
 * Client-side check before payment + API submit (matches backend required fields).
 * @param {object} body
 * @returns {string|null} Error message or null if OK.
 */
function getItrSubmitValidationError(body) {
  if (!body || typeof body !== "object") return "Invalid form data.";
  const ft = body.formType;
  const missing = [];

  const need = (val, label) => {
    if (val === undefined || val === null || String(val).trim() === "") missing.push(label);
  };

  if (ft === "job") {
    need(body.fullName, "Full name");
  } else if (ft === "business") {
    need(body.nameOfIndividualOrFirm, "Name of individual / firm");
  } else {
    return 'Form type must be "job" or "business".';
  }

  need(body.pan, "PAN");
  need(body.dateOfBirth, "Date of birth");
  need(body.mobile, "Mobile");
  need(body.email, "Email");
  need(body.accountNumber, "Account number");
  need(body.ifscCode, "IFSC code");
  need(body.bankName, "Bank name");
  need(body.accountType, "Account type");
  // Section 7 Declaration (place, declarationDate, signature) — optional

  if (missing.length > 0) {
    return `Please fill all required fields (${missing.join(", ")}).`;
  }

  const panNorm = String(body.pan).trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNorm)) {
    return "PAN must look like ABCDE1234F (5 letters, 4 digits, 1 letter).";
  }
  const mobDigits = String(body.mobile).replace(/\D/g, "");
  if (mobDigits.length !== 10) {
    return "Mobile must be exactly 10 digits.";
  }
  const ifscNorm = String(body.ifscCode).trim().toUpperCase();
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscNorm)) {
    return "IFSC must be 11 characters: 4 bank letters, then 0, then 6 characters (example: SBIN0001234).";
  }

  return null;
}

const MSME_ORG_TYPES = ["Proprietor", "Partnership", "LLP", "Pvt Ltd", "Other"];
const MSME_MAJOR_ACTIVITIES = ["Manufacturing", "Services"];
const MSME_ACCOUNT_TYPES = ["Savings", "Current", "Fixed Deposit", "Recurring Deposit"];

/**
 * Client-side check before payment + MSME submit (aligns with `msmeRegistration.model.js`).
 * @param {object} body
 * @returns {string|null}
 */
function getMsmeSubmitValidationError(body) {
  if (!body || typeof body !== "object") return "Invalid form data.";
  const missing = [];
  const need = (val, label) => {
    if (val === undefined || val === null || String(val).trim() === "") missing.push(label);
  };

  need(body.aadhaarNo, "Aadhaar number");
  need(body.nameOnAadhaar, "Name on Aadhaar");
  need(body.mobileLinkedToAadhaar, "Mobile (linked to Aadhaar)");
  need(body.email, "Email");
  need(body.enterpriseName, "Enterprise name");
  need(body.organisationType, "Organisation type");
  need(body.pan, "PAN");
  need(body.doorShopNo, "Door / shop number");
  need(body.street, "Street");
  need(body.areaLocality, "Area / locality");
  need(body.city, "City");
  need(body.pinCode, "PIN code");
  need(body.date, "Date");
  need(body.majorActivity, "Major activity");
  need(body.nicCode, "NIC code");
  need(body.investmentInMachineryEquipment, "Investment in machinery / equipment");
  need(body.annualTurnoverLastFY, "Annual turnover (last FY)");
  need(body.accountNumber, "Account number");
  need(body.ifscCode, "IFSC code");
  need(body.bankName, "Bank name");
  need(body.accountType, "Account type");
  need(body.place, "Place (declaration)");
  need(body.declarationDate, "Declaration date");
  need(body.signature, "Signature");

  if (missing.length > 0) {
    return `Please fill all required fields (${missing.join(", ")}).`;
  }

  const aadhaar = String(body.aadhaarNo).replace(/\D/g, "");
  if (aadhaar.length !== 12) {
    return "Aadhaar must be exactly 12 digits.";
  }
  const mobDigits = String(body.mobileLinkedToAadhaar).replace(/\D/g, "");
  if (mobDigits.length !== 10) {
    return "Mobile linked to Aadhaar must be exactly 10 digits.";
  }
  const panNorm = String(body.pan).trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNorm)) {
    return "PAN must look like ABCDE1234F.";
  }
  if (!MSME_ORG_TYPES.includes(String(body.organisationType).trim())) {
    return `Organisation type must be one of: ${MSME_ORG_TYPES.join(", ")}.`;
  }
  if (!MSME_MAJOR_ACTIVITIES.includes(String(body.majorActivity).trim())) {
    return 'Major activity must be "Manufacturing" or "Services".';
  }
  const pin = String(body.pinCode).replace(/\D/g, "");
  if (pin.length !== 6) {
    return "PIN code must be 6 digits.";
  }
  const nic = String(body.nicCode).trim();
  if (!/^[0-9]{2}$/.test(nic)) {
    return "NIC code must be 2 digits (as per form).";
  }
  const ifscNorm = String(body.ifscCode).trim().toUpperCase();
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscNorm)) {
    return "IFSC must be 11 characters (e.g. SBIN0001234).";
  }
  if (!MSME_ACCOUNT_TYPES.includes(String(body.accountType).trim())) {
    return "Select a valid account type from the list.";
  }

  const gst = body.gstin != null ? String(body.gstin).trim().toUpperCase() : "";
  if (gst) {
    if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)
    ) {
      return "GSTIN format is invalid, or leave it empty if not applicable.";
    }
  }

  return null;
}

/**
 * Client-side check before payment + Gumasta submit (aligns with `gumastaLicense.model.js`).
 * @param {object} body
 * @returns {string|null}
 */
function getGumastaSubmitValidationError(body) {
  if (!body || typeof body !== "object") return "Invalid form data.";
  const missing = [];
  const need = (val, label) => {
    if (val === undefined || val === null || String(val).trim() === "") missing.push(label);
  };

  need(body.applicantAuthorizedPersonName, "Applicant / authorized person name");
  need(body.fatherSpouseName, "Father / spouse name");
  need(body.designation, "Designation");
  need(body.mobileNo, "Mobile number");
  need(body.emailId, "Email");
  need(body.aadhaarNo, "Aadhaar number");
  need(body.panNo, "PAN");
  need(body.firmName, "Firm name");
  need(body.buildingShopNo, "Building / shop number");
  need(body.streetRoad, "Street / road");
  need(body.areaLocality, "Area / locality");
  need(body.city, "City");
  need(body.district, "District");
  need(body.pinCode, "PIN code");
  need(body.natureOfBusinessActivity, "Nature of business activity");
  need(body.premisesStatus, "Premises status");
  need(body.dateOfEstablishment, "Date of establishment");

  if (missing.length > 0) {
    return `Please fill all required fields (${missing.join(", ")}).`;
  }

  const aadhaar = String(body.aadhaarNo).replace(/\D/g, "");
  if (aadhaar.length !== 12) {
    return "Aadhaar must be exactly 12 digits.";
  }
  const mobDigits = String(body.mobileNo).replace(/\D/g, "");
  if (mobDigits.length !== 10) {
    return "Mobile number must be exactly 10 digits.";
  }
  const panNorm = String(body.panNo).trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNorm)) {
    return "PAN must look like ABCDE1234F.";
  }
  const email = String(body.emailId).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }

  return null;
}

let PostRequest = async (endPoint, requestBody) => {
  // console.log("requestBody==>", requestBody);

  try {
    let apiEndPoint = endPoint
    let apiBody = requestBody

    // Paid form submissions: Cashfree payment before POST to API.
    if (endPoint === "submitITRInformation") {
      const itrErr = getItrSubmitValidationError(requestBody);
      if (itrErr) {
        return { status: 400, message: itrErr };
      }
      const paymentResult = await payForItrBeforeSubmit(requestBody);
      if (!paymentResult.ok) {
        return paymentResult.response;
      }
    } else if (endPoint === "submitMSMERegistration") {
      const msmeErr = getMsmeSubmitValidationError(requestBody);
      if (msmeErr) {
        return { status: 400, message: msmeErr };
      }
      const paymentResult = await payForMsmeBeforeSubmit(requestBody);
      if (!paymentResult.ok) {
        return paymentResult.response;
      }
    } else if (endPoint === "submitGumastaLicense") {
      const gumErr = getGumastaSubmitValidationError(requestBody);
      if (gumErr) {
        return { status: 400, message: gumErr };
      }
      const paymentResult = await payForGumastaBeforeSubmit(requestBody);
      if (!paymentResult.ok) {
        return paymentResult.response;
      }
    } else if (endPoint === "checkCreditScorePdf") {
      // Cashfree payment before returning Surepass credit report PDF
      if (
        !requestBody?.name ||
        !requestBody?.email ||
        !requestBody?.mobile_no ||
        !requestBody?.pan
      ) {
        return {
          status: 400,
          message: "Missing required fields: name, email, mobile_no, pan",
        };
      }

      const paymentResult = await payForCreditScorePdfBeforeDownload(
        requestBody
      );
      if (!paymentResult.ok) {
        return paymentResult.response;
      }

      apiEndPoint = "checkCreditScore";
      apiBody = { ...requestBody, includePdf: true };
    }

    let result = await fetch(getServerUrl() + apiEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(apiBody), // Convert the object to JSON string
    });

    return parseFetchJson(result);
  } catch (error) {
    console.error("Error in API call:", error);
    return networkFailurePayload(error);
  }
};

let DeleteRequest = async (endPoint) => {
  try {
    let result = await fetch(getServerUrl() + endPoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return parseFetchJson(result);
  } catch (error) {
    console.error("Error in API call:", error);
    return networkFailurePayload(error);
  }
};

let PostRequestFormControl = async (endPoint, requestBody) => {

  try {
    let result = await fetch(getServerUrl() + endPoint, {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*", 
      },
      processData: false,
      contentType: false,
      body: requestBody,
    });
    return parseFetchJson(result);
  } catch (err) {
    console.log(err);
    return networkFailurePayload(err);
  }
};

let GetRequest = async (endPoint) => {
  try {
    // let accessToken = accessTokenProvider();
    const accessToken = localStorage.getItem("AccesToken");
    let result = await fetch(getServerUrl() + endPoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "x-access-token": accessToken,
      },
    });
    return parseFetchJson(result);
  } catch (err) {
    console.log(err);
    return networkFailurePayload(err);
  }
};

/**
 * Saves a CIBIL / credit PDF from checkCreditScore response data. Prefers fetch+blob so the file
 * lands in the browser Downloads folder with a known name; explains when the browser only opens a tab.
 * @param {object} res
 * @returns {Promise<{ icon: string, title: string, text: string }>}
 */
const runCibilPdfDownloadFromApiResponse = async (res) => {
  const genericMissing =
    res?.data?.pdfError ||
    "Credit report fetched successfully, but PDF data was not returned by Surepass.";

  if (res?.success === false || (typeof res?.status === "number" && res.status >= 400)) {
    const extra =
      res?.error != null && String(res.error) !== String(res?.message)
        ? String(res.error)
        : res?.errorName
          ? String(res.errorName)
          : "";
    const text = extra
      ? `${res?.message || "Could not prepare your credit report PDF."}\n\nDetails: ${extra}`
      : res?.message || "Could not prepare your credit report PDF.";
    return {
      icon: "error",
      title: "Download failed",
      text,
    };
  }

  const pdf = res?.data?.pdf;
  const possibleBase64 =
    (typeof pdf === "string" ? pdf : undefined) ||
    res?.data?.pdfBase64 ||
    pdf?.base64 ||
    pdf?.pdfBase64 ||
    pdf?.data?.base64 ||
    pdf?.data?.pdfBase64 ||
    pdf?.data?.pdf;

  const possibleUrl =
    res?.data?.pdfUrl ||
    pdf?.url ||
    pdf?.pdfUrl ||
    pdf?.data?.url ||
    pdf?.data?.pdfUrl ||
    pdf?.data?.credit_report_link ||
    pdf?.data?.report_link ||
    pdf?.credit_report_link ||
    pdf?.report_link;

  const fileName = `cibil-report-${Date.now()}.pdf`;

  const saveBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadsHint = `The file should appear in your browser’s Downloads folder as “${fileName}”. On Mac: Finder → Downloads. On Windows: File Explorer → Downloads. If the browser asks where to save, choose that folder.`;

  if (possibleUrl && typeof possibleUrl === "string") {
    try {
      const r = await fetch(possibleUrl, { mode: "cors", credentials: "omit" });
      if (r.ok) {
        const blob = await r.blob();
        const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
        const isPdf =
          head[0] === 0x25 &&
          head[1] === 0x50 &&
          head[2] === 0x44 &&
          head[3] === 0x46;
        const ct = (r.headers.get("content-type") || "").toLowerCase();
        if (isPdf || ct.includes("pdf")) {
          saveBlob(blob);
          return {
            icon: "success",
            title: "PDF saved",
            text: downloadsHint,
          };
        }
      }
    } catch {
      /* cross-origin or network — use fallback */
    }

    window.open(possibleUrl, "_blank", "noopener,noreferrer");
    return {
      icon: "success",
      title: "PDF ready",
      text:
        "Your report is loading. Many browsers save it automatically to Downloads (the name may look like credit_report_….pdf). If a new tab opens instead, use the download icon or File → Save As. Allow pop-ups for this site if nothing appears.",
    };
  }

  if (!possibleBase64 || typeof possibleBase64 !== "string") {
    return {
      icon: "error",
      title: "PDF not available",
      text: genericMissing,
    };
  }

  const base64 = possibleBase64.includes("base64,")
    ? possibleBase64.split("base64,")[1]
    : possibleBase64;

  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: "application/pdf" });
    saveBlob(blob);
    return {
      icon: "success",
      title: "PDF saved",
      text: downloadsHint,
    };
  } catch {
    return {
      icon: "error",
      title: "PDF not available",
      text: "The PDF data from the server could not be decoded. Please try again.",
    };
  }
};

export {
  PostRequest,
  PutRequest,
  GetRequestwithoutAuth,
  DeleteRequest,
  PostRequestFormControl,
  GetRequest,
  userDataProvider,
  runCibilPdfDownloadFromApiResponse,
};
