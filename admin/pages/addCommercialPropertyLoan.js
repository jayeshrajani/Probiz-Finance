import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import { postApihandler } from "../Apihandler";
import swal from "sweetalert";
export default function AddCommercialPropertyLoan() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [propertySize, setPropertySize] = useState("");
  const [constructionsize, setConstructionSize] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [profession, setProfession] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [incomeTaxReturn, setIncomeTaxReturn] = useState("");
  const [businessCertificate, setBuisnessCertificate] = useState("");
  const [otherIncomeSource, setOtherIncomeSource] = useState("");
  const [otherIncomeAmount, setOtherIncomeAmount] = useState("");
  const [aadharfront, setAadharFront] = useState("");
  const [aadharback, setAadharBack] = useState("");
  const [PanCard, setPanCard] = useState("");
  const [electricityBill, setElectricityBill] = useState("");
  const [propertyFront, setPropertyFront] = useState("");
  const [propertyInside, setPropertyInside] = useState("");
  const [propertyTaxReciept, setPropertyTaxReciept] = useState("");
  const [bankstatement, setBankStatement] = useState("");
  const [incomeTaxReturnFile, setIncomeTaxReturnFile] = useState("");
  const [salarySlipOrOfferLetter, setSalarySlipOrOfferLetter] = useState("");
  const [buisness, setBuisness] = useState("");
  const [PropertyPaper, setPropertyPaper] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", name);
    formData.append("dateOfBirth", dob);
    formData.append("address", address);
    formData.append("contactNumber", contactNumber);
    formData.append("alternateContact", alternateContact);
    formData.append("propertyType", propertyType);
    formData.append("propertySize", propertySize);
    formData.append("constructionSize", constructionsize);
    formData.append("marketValue", marketValue);
    formData.append("loanAmount", loanAmount);
    formData.append("profession", profession);
    formData.append("incomeType", incomeType);
    formData.append("monthlyIncome", monthlyIncome);
    formData.append("incomeTaxReturn", incomeTaxReturn);
    formData.append("businessCertificate", businessCertificate);
    formData.append("otherIncomeSource", otherIncomeSource);
    formData.append("otherIncomeAmount", otherIncomeAmount);
    formData.append("aadharFront", aadharfront);
    formData.append("aadharBack", aadharback);
    formData.append("panCard", PanCard);
    formData.append("electricityBill", electricityBill);
    formData.append("propertyFront", propertyFront);
    formData.append("propertyInside", propertyInside);
    formData.append("propertyTaxReceipt", propertyTaxReciept);
    formData.append("bankstatement", bankstatement);
    formData.append("incomeTaxReturnFile", incomeTaxReturnFile);
    formData.append("salarySlipOrOfferLetter", salarySlipOrOfferLetter);
    formData.append("forBusiness", buisness);
    formData.append("propertyPaper", PropertyPaper);
    const res = await postApihandler(
      "/addCommercialPropertyPurchaseOfferDetail",
      formData
    );

    console.log("add home loan api res is --->", res);
    if (res.message === "Loan details submitted successfully") {
      swal({
        title: "Loan details submitted successfully",
        icon: "success",
      });
    }
  };
  return (
    <AdminLayout>
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
                onChange={(e) => setAlternateContact(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
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
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="propertySize">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Property Size (sq ft)</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="propertySize"
                onChange={(e) => setPropertySize(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="constructionSize">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Construction Size (sq ft)</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="constructionSize"
                onChange={(e) => setConstructionSize(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="marketValue">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Market Value</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="marketValue"
                onChange={(e) => setMarketValue(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="loanAmount">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Loan Amount</Form.Label>
              </div>
              <Form.Control
                type="number"
                name="loanAmount"
                onChange={(e) => setLoanAmount(e.target.value)}
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
                <Form.Label>Upload Business Certificate</Form.Label>
              </div>
              <Form.Select
                name="businessCertificate"
                onChange={(e) => setBuisnessCertificate(e.target.value)}
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
          <Col md={6}>
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
          </Col>
          <Col md={6}>
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
          </Col>
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
                <Form.Label>Property Tax Receipt</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Property Tax Receipt"
                onChange={(e) => setPropertyTaxReciept(e.target.value)}
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
            <Form.Group controlId="salarySlipOrOfferLetter">
              <div style={{ textAlign: "left" }}>
                <Form.Label>SalarySlip Or OfferLetter</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="SalarySlip Or OfferLetter"
                onChange={(e) => setSalarySlipOrOfferLetter(e.target.value)}
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
                onChange={(e) => setBuisness(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
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
