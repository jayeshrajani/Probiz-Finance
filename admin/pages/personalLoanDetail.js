import React, { useEffect, useState } from 'react';
import { getApihandler } from '../Apihandler';
import { useParams } from 'react-router-dom';
import AdminLayout from '../Layout/AdminLayout';

export default function PersonalloanDetail() {
    const { id } = useParams();
    const [data, setData] = useState({});

    useEffect(() => {
        getPersonalLoan();
    }, []);

    const getPersonalLoan = async () => {
        const res = await getApihandler(`/getpersonalLoanApplicationById/${id}`);
        console.log("res",res);
        if (res.message === "Loan application get successfully") {
            setData(res.data);
        }
    };

    return (
        <AdminLayout>
            <div>
                <h1 className="title">Loan Details</h1>
                <div className="details-grid">
                    <p><strong>Name:</strong> {data.fullName}</p>
                    <p><strong>Date of Birth:</strong> {data.dateOfBirth}</p>
                    <p><strong>Contact Number:</strong> {data.contactNumber}</p>
                    <p><strong>Alternate Contact:</strong> {data.alternateContactNumber}</p>
                    <p><strong>Address:</strong> {data.address}</p>
                    <p><strong>Profession:</strong> {data.profession}</p>
                    <p><strong>Income Type:</strong> {data.incomeType}</p>
                    <p><strong>Monthly Income:</strong> ₹{data.monthlySalary}</p>
                    <p><strong>Loan Amount:</strong> ₹{data.loanAmountRequired}</p>
                    <p><strong>Residence Type:</strong> {data.residenceType}</p>
                    <p><strong>Reporting ManagerContact Number:</strong> {data.reportingManagerContactNumber} sq. ft.</p>
                    <p><strong>Reporting ManagerName:</strong> {data.reportingManagerName}</p>
                    <p><strong>Business Certificate:</strong> {data.businessCertificate}</p>
                    <p><strong>Company Name:</strong> {data.companyName}</p>
                    <p><strong>Income Tax Return:</strong> {data.incomeTaxReturn}</p>
                    <p><strong>CIBIL Score:</strong> {data.cibilScore}</p>
                </div>

                <h2 className="subtitle">Uploaded Documents</h2>
                <div className="documents-grid">
    <h2 className="subtitle">Uploaded Images</h2>
    <div className="image-grid">
        {data.uploadedDocuments && Object.entries(data.uploadedDocuments).map(([key, value]) => {
            if (!value || typeof value !== "string") return null; // Skip null or invalid values
            
            const isImage = /\.(png|jpg|jpeg)$/i.test(value);
            
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
            </div>
        </AdminLayout>
    );
}
