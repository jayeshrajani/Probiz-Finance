import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { postApihandler } from "../Apihandler";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import swal from "sweetalert";
export default function AddBalanceTransferTopUpLoan() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact, setAlternateContactNumber] = useState("");
  const [residenceType, setResidenceType] = useState("");
  const [currentLoanAmount, setCurrentLoanAmount] = useState("");
  const [currentLoanAmountInstallMent, setCurrentLoanAmountInstallMent] =
    useState("");
  const [loanAmountRequired, setLoanAmountRequired] = useState("");
  const [profession, setProfession] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyincome, setMonthlyIncome] = useState("");
  const [incomeTaxReturn, setIncomeTaxReturn] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [aadharFront, setAadharFront] = useState("");
  const [aadharBack, setAadharBack] = useState("");
  const [panCard, setPanCard] = useState("");
  const [electricityBill, setElectricityBill] = useState("");
  const [officePhoto, setOfficePhoto] = useState("");
  const [propertyFront, setPropertyFront] = useState("");
  const [propertyInside, setPropertyInside] = useState("");
  const [bankStatement, setBankStatement] = useState("");
  const [incomeTaxReturnFile, setIncomeTaxReturnFile] = useState("");
  const [buisnessDocument, setBuisnessDocument] = useState("");
  const [loanAccountStatement, setLoanAccountStatement] = useState("");
  const [listDocument, setListDocument] = useState("");
  const [forClosureletter, setForClosureLetter] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", name);
    formData.append("dateOfBirth", dob);
    formData.append("address", address);
    formData.append("contactNumber", contactNumber);
    formData.append("alternateContact", alternateContact);
    formData.append("residenceType", residenceType);
    formData.append("currentLoanAmount", currentLoanAmount);
    formData.append(
      "currentLoanInstallmentsPaid",
      currentLoanAmountInstallMent
    );
    formData.append("loanAmountRequired", loanAmountRequired);
    formData.append("profession", profession);
    formData.append("incomeType", incomeType);
    formData.append("totalMonthlyIncome", monthlyincome);
    formData.append("incomeTaxReturn", incomeTaxReturn);
    formData.append("cibilScore", cibilScore);
    formData.append("aadharFront", aadharFront);
    formData.append("aadharBack", aadharBack);
    formData.append("panCard", panCard);
    formData.append("electricityOrRentAgreement", electricityBill);
    formData.append("officeShopElectricityOrRent", officePhoto);
    formData.append("propertyPhotoFront", propertyFront);
    formData.append("propertyPhotoInside", propertyInside);
    formData.append("bankStatementLastYear", bankStatement);
    formData.append("incomeTaxReturnFile", incomeTaxReturnFile);
    formData.append("forBusinessDocuments", buisnessDocument);
    formData.append("bankStatementLastYear", bankStatement);
    formData.append("loanAccountStatement", loanAccountStatement);
    formData.append("listOfDocumentsByBank", listDocument);
    formData.append("foreclosureLetter", forClosureletter);

    const res = await postApihandler(
      "/addBalanceTransferTopUpDetail",
      formData
    );
    if (res.message === "Application submitted successfully!") {
      swal({
        title: "Application submitted successfully!",
        icon: "success",
      });
    }
    console.log("add balance transfer loan ---->", res);
  };
  return (
    <AdminLayout>
      <h4>Add BalanceTransfer Top Up Loan</h4>
      <Form onSubmit={handleSubmit} className="mt-5">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="fullName">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Full Name</Form.Label>
              </div>
              <Form.Control
                type="text"
                name="fullName"
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="dateOfBirth">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Date of Birth</Form.Label>
              </div>
              <Form.Control
                type="date"
                name="dateOfBirth"
                onChange={(e) => setDob(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="address">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Address</Form.Label>
              </div>
              <Form.Control
                type="text"
                name="address"
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="contactNumber">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Contact Number</Form.Label>
              </div>
              <Form.Control
                type="tel"
                name="contactNumber"
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="alternateContact">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Alternate Contact</Form.Label>
              </div>
              <Form.Control
                type="tel"
                name="alternateContact"
                onChange={(e) => setAlternateContactNumber(e.target.value)}
              />
            </Form.Group>
          </Col>
          {/* <Col md={6}>
            <Form.Group controlId="propertyType">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Property Type</Form.Label>
              </div>
              <Form.Select
                name="propertyType"
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Flat">Plot</option>
                <option value="Villa">Under Construction</option>
                <option value="Plot">Ready To Move</option>
              </Form.Select>
            </Form.Group>
          </Col> */}
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="ResidenceType">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Residence Type</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="residenceType"
                onChange={(e) => setResidenceType(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="current Loan amount installment">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Current Loan Amount Installment</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="current Loan amount installment"
                onChange={(e) =>
                  setCurrentLoanAmountInstallMent(e.target.value)
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="Loan Amount Required">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Loan Amount Required</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="Loan Amount Required"
                onChange={(e) => setLoanAmountRequired(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="loanAmount">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Current Loan Amount</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="currentloanAmount"
                onChange={(e) => setCurrentLoanAmount(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="profession">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Profession</Form.Label>
              </div>
              <Form.Select
                name="profession"
                onChange={(e) => setProfession(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Job">Job</option>
                <option value="Business">Business</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="incomeType">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Income Type</Form.Label>
              </div>
              <Form.Select
                name="incomeType"
                onChange={(e) => setIncomeType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Cash">Cash</option>
                <option value="Account">Account</option>
                <option value="Both">Both</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="monthlyIncome">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Monthly Income</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="monthlyIncome"
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="cibilScore">
              <div style={{ textAlign: "left" }}>
                <Form.Label>CIBIL Score</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="cibilScore"
                onChange={(e) => setCibilScore(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="profession">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Income Tax Return</Form.Label>
              </div>
              <Form.Select
                name="incomeTaxReturn"
                onChange={(e) => setIncomeTaxReturn(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Job">Yes</option>
                <option value="Business">No</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="businessCertificate">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Loan Account Statement</Form.Label>
              </div>
              <Form.Select
                name="loanaccountstatement"
                onChange={(e) => setLoanAccountStatement(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Gumasta">Gumasta</option>
                <option value="MSME">MSME</option>
                <option value="Nagar Nigam Certificate">
                  Nagar Nigam Certificate{" "}
                </option>
                <option value="Certificate of Incorporation">
                  Certificate of Incorporation
                </option>
                <option value="Others">Others</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          {/* <Col md={6}>
            <Form.Group controlId="otherIncomeSource">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Other Income Source</Form.Label>
              </div>
              <Form.Control
                type="text"
                name="otherIncomeSource"
                onChange={(e) => setOtherIncomeSource(e.target.value)}
              />
            </Form.Group>
          </Col> */}
          {/* <Col md={6}>
            <Form.Group controlId="otherIncomeAmount">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Other Income Amount</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="otherIncomeAmount"
                onChange={(e) => setOtherIncomeAmount(e.target.value)}
              />
            </Form.Group>
          </Col> */}
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="incomeTaxReturn">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Aadhar Front</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Aadhar Front"
                onChange={(e) => setAadharFront(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="businessCertificate">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Aadhar Back</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Aadhar Back"
                onChange={(e) => setAadharBack(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="pancard">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Pan Card</Form.Label>
              </div>
              <Form.Control
                type="text"
                name="pan card"
                onChange={(e) => setPanCard(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="electricitybill">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Electricity Bill</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="electricity bill"
                onChange={(e) => setElectricityBill(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="incomeTaxReturn">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Property Front</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Property Front"
                onChange={(e) => setPropertyFront(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="PropertyInside">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Property Inside</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Property Inside"
                onChange={(e) => setPropertyInside(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="incomeTaxReturn">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Property Front</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Property Front"
                onChange={(e) => setPropertyFront(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="PropertyInside">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Property Inside</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Property Inside"
                onChange={(e) => setPropertyInside(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="incomeTaxReturn">
              <div style={{ textAlign: "left" }}>
                <Form.Label>For Closure Letter</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="For Closure Letter"
                onChange={(e) => setForClosureLetter(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="PropertyInside">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Bank Statement</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Bank Statement"
                onChange={(e) => setBankStatement(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="incomeTaxReturn">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Income Tax ReturnFile</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Income Tax ReturnFile"
                onChange={(e) => setIncomeTaxReturnFile(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="listdocument">
              <div style={{ textAlign: "left" }}>
                <Form.Label>List Document</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="list document"
                onChange={(e) => setListDocument(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="incomeTaxReturn">
              <div style={{ textAlign: "left" }}>
                <Form.Label>For Business</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="For Business"
                onChange={(e) => setBuisnessDocument(e.target.value)}
              />
            </Form.Group>
          </Col>
          {/* <Col md={6}>
            <Form.Group controlId="salarySlipOrOfferLetter">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Property Paper</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Property Paper"
                onChange={(e) => setPropertyPaper(e.target.value)}
              />
            </Form.Group>
          </Col> */}
          <Col md={6}>
            <Form.Group controlId="OfficePhoto">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Office Photo</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Office Photo"
                onChange={(e) => setOfficePhoto(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center mt-4">
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
