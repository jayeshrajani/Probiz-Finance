import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import swal from "sweetalert";
import { postApihandler } from "../Apihandler";

export default function AddGoldLoan() {
  const [fullName, setFullName] = useState("");
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [occupationOrBusiness, setOccupationOrBusiness] = useState("");
  const [monthlyOrAnnualIncome, setMonthlyOrAnnualIncome] = useState("");
  const [goldType, setGoldType] = useState("");
  const [goldWeightInGrams, setGoldWeightInGrams] = useState("");
  const [goldPurity, setGoldPurity] = useState("");
  const [loanAmountRequired, setLoanAmountRequired] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [preferredRepaymentTenure, setPreferredRepaymentTenure] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      fullName: fullName,
      fatherOrHusbandName: fatherOrHusbandName,
      motherName: motherName,
      dateOfBirth: dateOfBirth,
      permanentAddress: permanentAddress,
      contactNumber: contactNumber,
      email: email,
      occupationOrBusiness: occupationOrBusiness,
      monthlyOrAnnualIncome: monthlyOrAnnualIncome,
      goldType: goldType,
      goldWeightInGrams: goldWeightInGrams,
      goldPurity: goldPurity,
      loanAmountRequired: loanAmountRequired,
      loanPurpose: loanPurpose,
      preferredRepaymentTenure: preferredRepaymentTenure,
    };

    const res = await postApihandler("/addGoldLoan", data);

    console.log("add home loan api res is --->", res);
    if (res.message === "Gold loan application submitted successfully") {
      swal({
        title: "Gold loan application submitted successfully",
        icon: "success",
      });
    }
  };

  return (
    <AdminLayout>
      <h2 className="mb-4">Add Gold Loan</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="fatherOrHusbandName">
              <Form.Label>Father or Husband Name</Form.Label>
              <Form.Control
                type="text"
                value={fatherOrHusbandName}
                onChange={(e) => setFatherOrHusbandName(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="motherName">
              <Form.Label>Mother Name</Form.Label>
              <Form.Control
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="dateOfBirth">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="permanentAddress">
              <Form.Label>Permanent Address</Form.Label>
              <Form.Control
                type="text"
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="contactNumber">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="occupationOrBusiness">
              <Form.Label>Occupation / Business</Form.Label>
              <Form.Select
                value={occupationOrBusiness}
                onChange={(e) => setOccupationOrBusiness(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Job">Job</option>
                <option value="Buisness">Buisness</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="monthlyOrAnnualIncome">
              <Form.Label>Monthly / Annual Income</Form.Label>
              <Form.Control
                type="number"
                value={monthlyOrAnnualIncome}
                onChange={(e) => setMonthlyOrAnnualIncome(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="goldType">
              <Form.Label>Gold Type</Form.Label>

              <Form.Select
                value={goldType}
                onChange={(e) => setGoldType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="24K">24K</option>
                <option value="22K">22K</option>
                <option value="18K">18K</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="goldWeightInGrams">
              <Form.Label>Gold Weight (in grams)</Form.Label>
              <Form.Control
                type="number"
                value={goldWeightInGrams}
                onChange={(e) => setGoldWeightInGrams(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="goldPurity">
              <Form.Label>Gold Purity</Form.Label>
              <Form.Select
                value={goldPurity}
                onChange={(e) => setGoldPurity(e.target.value)}
              >
                <option value="">Select</option>
                <option value="24K">24K</option>
                <option value="22K">22K</option>
                <option value="18K">18K</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="loanAmountRequired">
              <Form.Label>Loan Amount Required</Form.Label>
              <Form.Control
                type="number"
                value={loanAmountRequired}
                onChange={(e) => setLoanAmountRequired(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="loanPurpose">
              <Form.Label>Loan Purpose</Form.Label>
              <Form.Control
                type="text"
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group controlId="preferredRepaymentTenure">
              <Form.Label>Preferred Repayment Tenure</Form.Label>
              <Form.Control
                type="text"
                value={preferredRepaymentTenure}
                onChange={(e) => setPreferredRepaymentTenure(e.target.value)}
                placeholder="e.g. 12 Months"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-center">
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: "#121942", border: "none" }}
          >
            Submit Application
          </Button>
        </div>
      </Form>
    </AdminLayout>
  );
}
