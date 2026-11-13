import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getApihandler } from "../Apihandler";
import { useParams } from "react-router-dom";

export default function BalanceTranferTopupDetail() {
  const { id } = useParams();
  const [data, setData] = useState({});

  useEffect(() => {
    getBalanceTransfer();
  }, []);

  const getBalanceTransfer = async () => {
    const res = await getApihandler(`/getBalancetransfersTopUpById/${id}`);
    console.log("res", res);

    if (res.success === true) {
      setData(res.data);
    }
  };

  return (
    <AdminLayout>
      <h4>Balance top up transfer detail</h4>
      <div>
        <div className="details-grid">
          <p>
            <strong>Full Name:</strong> {data.fullName}
          </p>
          <p>
            <strong>Date of Birth:</strong> {data.dateOfBirth}
          </p>
          <p>
            <strong>Contact Number:</strong> {data.contactNumber}
          </p>
          <p>
            <strong>Alternate Contact:</strong> {data.alternateContact}
          </p>
          <p>
            <strong>Address:</strong> {data.address}
          </p>
          <p>
            <strong>Profession:</strong> {data.profession}
          </p>
          <p>
            <strong>Income Type:</strong> {data.incomeType}
          </p>
          <p>
            <strong>Monthly Income:</strong> ₹{data.totalMonthlyIncome}
          </p>
          <p>
            <strong>Income Tax Return:</strong> {data.incomeTaxReturn}
          </p>
          <p>
            <strong>Loan Amount Required:</strong> ₹{data.loanAmountRequired}
          </p>
          <p>
            <strong>Residence Type:</strong> {data.residenceType}
          </p>
          <p>
            <strong>Current Loan Amount:</strong> ₹{data.currentLoanAmount}
          </p>
          <p>
            <strong>Current Loan Installment Paid:</strong> ₹
            {data.currentLoanInstallmentsPaid}
          </p>
          <p>
            <strong>CIBIL Score:</strong> {data.cibilScore}
          </p>
        </div>

        <h2 className="subtitle">Uploaded Documents</h2>
        <div className="documents-grid">
          <h2 className="subtitle">Uploaded Images</h2>
          <div className="image-grid">
            {data.uploadedDocuments &&
              Object.entries(data.uploadedDocuments).map(([key, value]) => {
                if (!value || typeof value !== "string") return null;
                const isImage = /\.(png|jpe?g)$/i.test(value);
                return isImage ? (
                  <div key={key} className="document-card">
                    <p className="document-title">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <img
                      src={value}
                      alt={key}
                      className="document-image"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                ) : null;
              })}
          </div>

          <h2 className="subtitle">Uploaded PDFs</h2>
          <div className="pdf-grid">
            {data.uploadedDocuments &&
              Object.entries(data.uploadedDocuments).map(([key, value]) => {
                if (!value || typeof value !== "string") return null;
                const isPdf = value.toLowerCase().endsWith(".pdf");
                return isPdf ? (
                  <div key={key} className="document-card">
                    <p className="document-title">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      Download PDF
                    </a>
                  </div>
                ) : null;
              })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
