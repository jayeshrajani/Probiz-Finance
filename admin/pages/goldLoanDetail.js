import React, { useEffect, useState } from 'react';
import { getApihandler } from '../Apihandler';
import { useParams } from 'react-router-dom';
import AdminLayout from '../Layout/AdminLayout';

export default function GoldLoanDetail() {
    const { id } = useParams();
    const [data, setData] = useState({});

    useEffect(() => {
        getGoldLoan();
    }, []);

    const getGoldLoan = async () => {
        const res = await getApihandler(`/getGoldLoanById/${id}`);
        console.log("res", res);

        if (res.message === "Gold loan application fetched successfully") {
            setData(res.data);
        }
    };

    return (
        <AdminLayout>
            <div>
                <h1 className="title">Gold Loan Details</h1>

                <div className="details-grid">
                    <p><strong>Full Name:</strong> {data.fullName}</p>
                    <p><strong>Father/Husband Name:</strong> {data.fatherOrHusbandName}</p>
                    <p><strong>Mother's Name:</strong> {data.motherName}</p>
                    <p><strong>Date of Birth:</strong> {data.dateOfBirth}</p>
                    <p><strong>Permanent Address:</strong> {data.permanentAddress}</p>
                    <p><strong>Contact Number:</strong> {data.contactNumber}</p>
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>Occupation/Business:</strong> {data.occupationOrBusiness}</p>
                    <p><strong>Monthly/Annual Income:</strong> ₹{data.monthlyOrAnnualIncome}</p>
                    <p><strong>Gold Type:</strong> {data.goldType}</p>
                    <p><strong>Gold Weight (in grams):</strong> {data.goldWeightInGrams}</p>
                    <p><strong>Gold Purity:</strong> {data.goldPurity}</p>
                    <p><strong>Loan Amount Required:</strong> ₹{data.loanAmountRequired}</p>
                    <p><strong>Loan Purpose:</strong> {data.loanPurpose}</p>
                    <p><strong>Preferred Repayment Tenure:</strong> {data.preferredRepaymentTenure}</p>
                </div>



            </div>
        </AdminLayout>
    );

}
