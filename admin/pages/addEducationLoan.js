import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import swal from "sweetalert";
import axios from "axios";
import { postApihandler } from "../Apihandler";

export default function AddEducationLoan() {
  // Text fields
  const [fullName, setFullName] = useState("");
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [courseName, setCourseName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [totalFees, setTotalFees] = useState("");
  const [loanAmountRequired, setLoanAmountRequired] = useState("");
  const [occupationOrBusiness, setOccupationOrBusiness] = useState("");
  const [monthlyOrAnnualIncome, setMonthlyOrAnnualIncome] = useState("");
  const [coApplicantName, setCoApplicantName] = useState("");
  const [coApplicantFatherOrHusbandName, setCoApplicantFatherOrHusbandName] =
    useState("");
  const [coApplicantDateOfBirth, setCoApplicantDateOfBirth] = useState("");
  const [coApplicantRelationship, setCoApplicantRelationship] = useState("");
  const [coApplicantAddress, setCoApplicantAddress] = useState("");
  const [coApplicantContact, setCoApplicantContact] = useState("");
  const [coApplicantIncome, setCoApplicantIncome] = useState("");
  const [collateralType, setCollateralType] = useState("");
  const [collateralLocation, setCollateralLocation] = useState("");
  const [collateralMarketValue, setCollateralMarketValue] = useState("");

  // File fields
  const [admissionLetter, setAdmissionLetter] = useState(null);
  const [previousMarkSheets, setPreviousMarkSheets] = useState(null);
  const [feeStructure, setFeeStructure] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("fatherOrHusbandName", fatherOrHusbandName);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("permanentAddress", permanentAddress);
    formData.append("contactNumber", contactNumber);
    formData.append("email", email);
    formData.append("courseName", courseName);
    formData.append("institutionName", institutionName);
    formData.append("institutionAddress", institutionAddress);
    formData.append("admissionDate", admissionDate);
    formData.append("courseDuration", courseDuration);
    formData.append("totalFees", totalFees);
    formData.append("loanAmountRequired", loanAmountRequired);
    formData.append("occupationOrBusiness", occupationOrBusiness);
    formData.append("monthlyOrAnnualIncome", monthlyOrAnnualIncome);
    formData.append("coApplicantName", coApplicantName);
    formData.append(
      "coApplicantFatherOrHusbandName",
      coApplicantFatherOrHusbandName
    );
    formData.append("coApplicantDateOfBirth", coApplicantDateOfBirth);
    formData.append("coApplicantRelationship", coApplicantRelationship);
    formData.append("coApplicantAddress", coApplicantAddress);
    formData.append("coApplicantContact", coApplicantContact);
    formData.append("coApplicantIncome", coApplicantIncome);
    formData.append("collateralType", collateralType);

    formData.append("collateralLocation", collateralLocation);
    formData.append("collateralMarketValue", collateralMarketValue);
    formData.append("admissionLetter", admissionLetter);
    formData.append("previousMarkSheets", previousMarkSheets);
    formData.append("feeStructure", feeStructure);

    const res = await postApihandler("/addEducationLoan", formData);
    console.log("add home loan api res is --->", res);
    if (res.message === "Education loan application submitted successfully.") {
      swal({
        title: "Education loan application submitted successfully.",
        icon: "success",
      });
    }
  };

  return (
    <AdminLayout>
      {/* <Container className="mt-4"> */}
      <h3>Add Education Loan Application</h3>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>Full Name</Form.Label>
              <Form.Control
                name="fullName"
                onChange={(e) => setFullName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Father/Husband Name
              </Form.Label>
              <Form.Control
                name="fatherOrHusbandName"
                onChange={(e) => setFatherOrHusbandName(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Date of Birth
              </Form.Label>
              <Form.Control
                type="date"
                name="dateOfBirth"
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Permanent Address
              </Form.Label>
              <Form.Control
                name="permanentAddress"
                onChange={(e) => setPermanentAddress(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Contact Number
              </Form.Label>
              <Form.Control
                name="contactNumber"
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>Course Name</Form.Label>
              <Form.Control
                name="courseName"
                onChange={(e) => setCourseName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Institution Name
              </Form.Label>
              <Form.Control
                name="institutionName"
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Institution Address
              </Form.Label>
              <Form.Control
                name="institutionAddress"
                onChange={(e) => setInstitutionAddress(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Admission Date
              </Form.Label>
              <Form.Control
                type="date"
                name="admissionDate"
                onChange={(e) => setAdmissionDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Course Duration
              </Form.Label>
              <Form.Control
                name="courseDuration"
                onChange={(e) => setCourseDuration(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>Total Fees</Form.Label>
              <Form.Control
                name="totalFees"
                onChange={(e) => setTotalFees(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Loan Amount Required
              </Form.Label>
              <Form.Control
                name="loanAmountRequired"
                onChange={(e) => setLoanAmountRequired(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Occupation/Business
              </Form.Label>
              <Form.Control
                name="occupationOrBusiness"
                onChange={(e) => setOccupationOrBusiness(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Monthly/Annual Income
              </Form.Label>
              <Form.Control
                name="monthlyOrAnnualIncome"
                onChange={(e) => setMonthlyOrAnnualIncome(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Co-Applicant Name
              </Form.Label>
              <Form.Control
                name="coApplicantName"
                onChange={(e) => setCoApplicantName(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Co-Applicant Father/Husband Name
              </Form.Label>
              <Form.Control
                name="coApplicantFatherOrHusbandName"
                onChange={(e) =>
                  setCoApplicantFatherOrHusbandName(e.target.value)
                }
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Co-Applicant Date of Birth
              </Form.Label>
              <Form.Control
                type="date"
                name="coApplicantDateOfBirth"
                onChange={(e) => setCoApplicantDateOfBirth(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Co-Applicant Relationship
              </Form.Label>
              <Form.Control
                name="coApplicantRelationship"
                onChange={(e) => setCoApplicantRelationship(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Co-Applicant Address
              </Form.Label>
              <Form.Control
                name="coApplicantAddress"
                onChange={(e) => setCoApplicantAddress(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Co-Applicant Contact
              </Form.Label>
              <Form.Control
                name="coApplicantContact"
                onChange={(e) => setCoApplicantContact(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Co-Applicant Income
              </Form.Label>
              <Form.Control
                name="coApplicantIncome"
                onChange={(e) => setCoApplicantIncome(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Collateral Type
              </Form.Label>
              <Form.Control
                name="collateralType"
                onChange={(e) => setCollateralType(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Collateral Location
              </Form.Label>
              <Form.Control
                name="collateralLocation"
                onChange={(e) => setCollateralLocation(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Collateral Market Value
              </Form.Label>
              <Form.Control
                name="collateralMarketValue"
                onChange={(e) => setCollateralMarketValue(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Admission Letter
              </Form.Label>
              <Form.Control
                type="file"
                name="admissionLetter"
                onChange={(e) => setAdmissionLetter(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Previous Mark Sheets
              </Form.Label>
              <Form.Control
                type="file"
                name="previousMarkSheets"
                onChange={(e) => setPreviousMarkSheets(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ textAlign: "left" }}>
                Fee Structure
              </Form.Label>
              <Form.Control
                type="file"
                name="feeStructure"
                onChange={(e) => setFeeStructure(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center mb-5">
          <Button type="submit" variant="primary">
            Submit Application
          </Button>
        </div>
      </Form>
      {/* </Container> */}
    </AdminLayout>
  );
}
