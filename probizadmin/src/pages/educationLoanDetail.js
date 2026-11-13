import React, { useEffect, useState } from 'react';
import { getApihandler } from '../Apihandler';
import { useParams } from 'react-router-dom';
import AdminLayout from '../Layout/AdminLayout';

export default function EducationLoanDetail() {
    const { id } = useParams();
    const [data, setData] = useState({});

    useEffect(() => {
        getEducationLoan();
    }, []);

    const getEducationLoan = async () => {
        const res = await getApihandler(`/getEducationLoanById/${id}`);
        console.log("res",res);
        
        if (res.message === "Education loan application get successfully") {
            setData(res.data);
        }
    };

   return (
  <AdminLayout>
    <div>
      <h1 className="title">Education Loan Details</h1>

      <div className="details-grid">
        <p><strong>Full Name:</strong> {data.fullName}</p>
        <p><strong>Date of Birth:</strong> {data.dateOfBirth}</p>
        <p><strong>Father/Husband Name:</strong> {data.fatherOrHusbandName}</p>
        <p><strong>Contact Number:</strong> {data.contactNumber}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Permanent Address:</strong> {data.permanentAddress}</p>
        <p><strong>Occupation/Business:</strong> {data.occupationOrBusiness}</p>
        <p><strong>Monthly/Annual Income:</strong> {data.monthlyOrAnnualIncome}</p>
        <p><strong>Loan Amount Required:</strong> ₹{data.loanAmountRequired}</p>
        <p><strong>Institution Name:</strong> {data.institutionName}</p>
        <p><strong>Institution Address:</strong> {data.institutionAddress}</p>
        <p><strong>Course Name:</strong> {data.courseName}</p>
        <p><strong>Course Duration:</strong> {data.courseDuration}</p>
        <p><strong>Admission Date:</strong> {data.admissionDate}</p>
        <p><strong>Total Fees:</strong> ₹{data.totalFees}</p>
      </div>

      <h2 className="subtitle">Co-Applicant Details</h2>
      <div className="details-grid">
        <p><strong>Name:</strong> {data.coApplicantName}</p>
        <p><strong>Relationship:</strong> {data.coApplicantRelationship}</p>
        <p><strong>Date of Birth:</strong> {data.coApplicantDateOfBirth}</p>
        <p><strong>Father/Husband Name:</strong> {data.coApplicantFatherOrHusbandName}</p>
        <p><strong>Address:</strong> {data.coApplicantAddress}</p>
        <p><strong>Contact:</strong> {data.coApplicantContact}</p>
        <p><strong>Income:</strong> ₹{data.coApplicantIncome}</p>
      </div>

      <h2 className="subtitle">Collateral Details</h2>
      <div className="details-grid">
        <p><strong>Type:</strong> {data.collateralType}</p>
        <p><strong>Location:</strong> {data.collateralLocation}</p>
        <p><strong>Market Value:</strong> ₹{data.collateralMarketValue}</p>
      </div>

      <h2 className="subtitle">Uploaded Images</h2>
      <div className="image-grid">
        {data.uploadedDocuments && Object.entries(data.uploadedDocuments).map(([key, value]) => {
          if (!value || typeof value !== "string") return null;
          const isImage = /\.(png|jpe?g)$/i.test(value);
          return isImage ? (
            <div key={key} className="document-card">
              <p className="document-title">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <img src={value} alt={key} className="document-image" 
                   onError={(e) => e.target.style.display = 'none'} />
            </div>
          ) : null;
        })}
      </div>

      <h2 className="subtitle">Uploaded PDFs</h2>
    <div className="pdf-grid">
        {data.uploadedDocuments && Object.entries(data.uploadedDocuments).map(([key, value]) => {
            if (!value || typeof value !== "string") return null; // Skip null or invalid values
            
            const isPdf = value.toLowerCase().endsWith('.pdf');
            
            return isPdf ? (
                <div key={key} className="document-card">
                    <p className="document-title">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <a href={value} target="_blank" rel="noopener noreferrer" className="download-button">
                        Download PDF
                    </a>
                </div>
            ) : null;
        })}
    </div>
    </div>
  </AdminLayout>
);

}
