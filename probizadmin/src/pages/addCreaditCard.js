import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import { postApihandler } from "../Apihandler";
import swal from "sweetalert";
export default function AddCreaditCard() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [aadharfront, setAadharFront] = useState("");
  const [aadharback, setAadharBack] = useState("");
  const [PanCard, setPanCard] = useState("");
  const [electricityBill, setElectricityBill] = useState("");
  const [incomeTaxReturnFile, setIncomeTaxReturnFile] = useState("");
  const [bankstatement, setBankStatement] = useState("");
  const [salarySlipOrOfferLetter, setSalarySlipOrOfferLetter] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", name);
    formData.append("dateOfBirth", dob);
    formData.append("address", address);
    formData.append("contactNumber", contactNumber);
    formData.append("alternateContact", alternateContact);
    formData.append("incomeType", incomeType);
    formData.append("monthlySalary", monthlyIncome);
    formData.append("aadharFront", aadharfront);
    formData.append("aadharBack", aadharback);
    formData.append("panCard", PanCard);
    formData.append("electricityBillOrRentAgreement", electricityBill);
    formData.append("bankstatement", bankstatement);
    formData.append("incomeTaxReturnFile", incomeTaxReturnFile);
    formData.append("salarySlipOrOfferLetter", salarySlipOrOfferLetter);

    const res = await postApihandler("/creditCardDetail", formData);

    console.log("add home loan api res is --->", res);
    if (res.message === "Credit Card Detail submitted successfully") {
      swal({
        title: "Credit Card Detail submitted successfully",
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
          {/* <Col md={6}>
            <Form.Group controlId="buisnessName">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Buisness Name</Form.Label>
              </div>
              <Form.Control
                name="buisnessName"
                onChange={(e) => setBuisnessName(e.target.value)}
              />
            </Form.Group>
          </Col> */}
        </Row>

        <Row className="mb-3">
          {/* <Col md={6}>
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
          </Col> */}
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
            <Form.Group controlId="BankStatement">
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
          <Col md={6}>
            <Form.Group controlId="salarySlipOrOfferLetter">
              <div style={{ textAlign: "left" }}>
                <Form.Label>Salary Slip Or OfferLetter</Form.Label>
              </div>
              <Form.Control
                type="file"
                name="salarySlipOrOfferLetter"
                onChange={(e) => setSalarySlipOrOfferLetter(e.target.value)}
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
