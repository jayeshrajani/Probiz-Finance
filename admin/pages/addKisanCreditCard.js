import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import { postApihandler } from "../Apihandler";
import swal from "sweetalert";
export default function AddKisanCreditCard() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [residenceType, setResidenceType] = useState("");
  const [TotalLand, setTotalLand] = useState("");
  const [pawti, setPawti] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  //   const [profession, setProfession] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [incomeTaxReturn, setIncomeTaxReturn] = useState("");
  //   const [businessCertificate, setBuisnessCertificate] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [aadharfront, setAadharFront] = useState("");
  const [aadharback, setAadharBack] = useState("");
  const [PanCard, setPanCard] = useState("");
  const [electricityBill, setElectricityBill] = useState("");
  const [incomeTaxReturnFile, setIncomeTaxReturnFile] = useState("");
  const [bankstatement, setBankStatement] = useState("");
  const [pawtidocument, setPawtiDocument] = useState("");
  const [khasracopy, setKhasraCopy] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", name);
    formData.append("dateOfBirth", dob);
    formData.append("address", address);
    formData.append("contactNumber", contactNumber);
    formData.append("alternateContactNumber", alternateContact);
    formData.append("residenceType", residenceType);
    formData.append("totalLand", TotalLand);
    formData.append("pawti", pawti);
    formData.append("loanAmountRequired", loanAmount);
    // formData.append("profession", profession);
    formData.append("incomeType", incomeType);
    formData.append("monthlySalary", monthlyIncome);
    formData.append("incomeTaxReturn", incomeTaxReturn);
    formData.append("cibilScore", cibilScore);
    // formData.append("businessCertificate", businessCertificate);
    formData.append("aadharFront", aadharfront);
    formData.append("aadharBack", aadharback);
    formData.append("panCard", PanCard);
    formData.append("electricityBillOrRentAgreement", electricityBill);
    formData.append("bankstatement", bankstatement);
    formData.append("incomeTaxReturnFile", incomeTaxReturnFile);
    formData.append("pawtiDocument", pawtidocument);
    formData.append("khasraCopy", khasracopy);

    const res = await postApihandler("/kisanCreditLoanApplication", formData);
    console.log("add home loan api res is --->", res);
    if (res.message === "Application submitted successfully") {
      swal({
        title: "Loan application submitted successfully",
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
            <Form.Group controlId="TotalLand(in acre)">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Total Land (in acre)</Form.Label>
              </div>
              <Form.Control
                name="TotalLand(in acre)"
                onChange={(e) => setTotalLand(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="marketValue">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Residence Type</Form.Label>
              </div>
              <Form.Select
                name="residenceType"
                onChange={(e) => setResidenceType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Owned">Owned </option>
                <option value="Rented">Rented</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="loanAmount">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Loan Amount</Form.Label>
              </div>
              <Form.Control
                type="text"
                name="loanAmount"
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="marketValue">
              <div style={{ textAlign: "left" }}>
                <Form.Label>pawti</Form.Label>
              </div>
              <Form.Select
                name="pawti"
                onChange={(e) => setPawti(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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
                type="file"
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
                type="file"
                name="electricity bill"
                onChange={(e) => setElectricityBill(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="Income Tax Return File">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Income Tax Return File</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Income Tax Return File"
                onChange={(e) => setIncomeTaxReturnFile(e.target.value)}
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
            <Form.Group controlId="Pawti Document">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Pawti Document</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Pawti Document"
                onChange={(e) => setPawtiDocument(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="Khasra Copy">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Khasra Copy</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="Khasra Copy"
                onChange={(e) => setKhasraCopy(e.target.value)}
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
