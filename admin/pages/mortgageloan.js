import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { getApihandler, putApihandler } from "../Apihandler";
import AdminLayout from "../Layout/AdminLayout";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import swal from "sweetalert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Container, Form, Row, Col } from "react-bootstrap";
import EditIcon from "@mui/icons-material/Edit";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
  maxHeight: "90vh",
};
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#121942",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function MortgageLoan() {
  // States
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //  Life cycle
  useEffect(() => {
    getHomeLoan();
  }, []);

  // Functions
  const getHomeLoan = async () => {
    const res = await getApihandler("/getLoanagainstProperty");
    console.log("res", res);
    if (res.message === "Loan details retrieved successfully") {
      setData(res.data);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Un-commented to set rows per page
    setPage(0);
  };

  // *********** update home loan ************
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
  const [loanid, setLoanId] = useState("");
  console.log("loan id is ---->", loanid);
  const [index, setIndex] = useState("");
  useEffect(() => {
    if (index !== "") {
      const {
        fullName,
        dateOfBirth,
        address,
        contactNumber,
        alternateContact,
        propertyType,
        propertySize,
        constructionSize,
        marketValue,
        loanAmount,
        profession,
        incomeType,
        monthlyIncome,
        incomeTaxReturn,
        businessCertificate,
        otherIncomeSource,
        otherIncomeAmount,
        aadharFront,
        aadharBack,
        panCard,
        electricityBill,
        propertyFront,
        propertyInside,
        propertyTaxReceipt,
        bankstatement,
        incomeTaxReturnFile,
        salarySlipOrOfferLetter,
        buisness,
        PropertyPaper,
      } = data[index] || {};

      setOpen(true);
      setName(fullName || "");
      setDob(dateOfBirth || "");
      setAddress(address || "");
      setContactNumber(contactNumber || "");
      setAlternateContact(alternateContact || "");
      setPropertyType(propertyType || "");
      setPropertySize(propertySize || "");
      setConstructionSize(constructionSize || "");
      setMarketValue(marketValue || "");
      setLoanAmount(loanAmount || "");
      setProfession(profession || "");
      setIncomeType(incomeType || "");
      setMonthlyIncome(monthlyIncome || "");
      setIncomeTaxReturn(incomeTaxReturn || "");
      setBuisnessCertificate(businessCertificate || "");
      setOtherIncomeSource(otherIncomeSource || "");
      setOtherIncomeAmount(otherIncomeAmount || "");
      setAadharFront(aadharFront || "");
      setAadharBack(aadharBack || "");
      setPanCard(panCard || "");
      setElectricityBill(electricityBill || "");
      setPropertyFront(propertyFront || "");
      setPropertyInside(propertyInside || "");
      setPropertyTaxReciept(propertyTaxReceipt || "");
      setBankStatement(bankstatement || "");
      setIncomeTaxReturnFile(incomeTaxReturnFile || "");
      setSalarySlipOrOfferLetter(salarySlipOrOfferLetter || "");
      setBuisness(buisness || "");
      setPropertyPaper(PropertyPaper || "");
      setCibilScore(cibilScore || "");
    }
  }, [index, data]);
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
    // const res = await postApihandler("/loanOfferDetail", formData);
    const res = await putApihandler(
      `/updateLoanAgainstPropertyDetail/${loanid}`,
      formData
    );
    console.log("update home loan api res is --->", res);
    if (res.message === "Loan details updated successfully") {
      swal({
        title: "Loan details updated successfully",
        icon: "success",
      });
      getHomeLoan();
      setOpen(false);
    }
  };
  return (
    <>
      <AdminLayout>
        <h1>Mortgage Loan</h1>
        {/* Data table */}
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Link to="/add-mortrage-loan">
            <Button
              variant="contained"
              sx={{ textTransform: "capitalize", backgroundColor: "#121942" }}
            >
              Add Mortrage Loan
            </Button>
          </Link>
        </div>
        <TableContainer component={Paper} sx={{ maxWidth: 1200 }}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: "10%" }}>Sr no.</StyledTableCell>
                <StyledTableCell sx={{ width: "20%" }}>Name</StyledTableCell>
                <StyledTableCell>DOB</StyledTableCell>
                <StyledTableCell>Contact</StyledTableCell>
                <StyledTableCell>Loan Amount</StyledTableCell>
                <StyledTableCell>Monthly Income</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <StyledTableRow key={row._id}>
                    <StyledTableCell component="th" scope="row">
                      {page * rowsPerPage + index + 1}
                    </StyledTableCell>
                    <StyledTableCell>{row.fullName}</StyledTableCell>
                    <StyledTableCell>{row.dateOfBirth}</StyledTableCell>
                    <StyledTableCell>{row.contactNumber}</StyledTableCell>
                    <StyledTableCell>{row.loanAmount}</StyledTableCell>
                    <StyledTableCell>{row.monthlyIncome}</StyledTableCell>
                    <StyledTableCell>
                      <Link to={`/mortgage-loan-detail/${row._id}`}>
                        <RemoveRedEyeIcon />
                      </Link>
                      <Link>
                        <EditIcon
                          sx={{ marginLeft: "10px" }}
                          // onClick={handleOpen}
                          onClick={() => {
                            setLoanId(row._id);
                            setIndex(index);
                            // setOpen(true);
                          }}
                        />
                      </Link>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* ******** edit Modal box ******* */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Edit Home Loan
            </Typography>
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
                      value={name}
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
                      value={dob}
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
                      value={address}
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
                      value={contactNumber}
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
                      value={alternateContact}
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
                      value={propertyType}
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
                      value={propertySize}
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
                      value={constructionsize}
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
                      value={marketValue}
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
                      value={loanAmount}
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
                      value={profession}
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
                      value={incomeType}
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
                      value={monthlyIncome}
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
                      value={cibilScore}
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
                      value={incomeTaxReturn}
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
                      value={businessCertificate}
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
                      value={otherIncomeSource}
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
                      value={otherIncomeAmount}
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
                      value={aadharfront}
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
                      value={aadharback}
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
                      value={PanCard}
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
                      value={electricityBill}
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
                      value={propertyFront}
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
                      value={propertyInside}
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
                      value={propertyFront}
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
                      value={propertyInside}
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
                      value={propertyTaxReciept}
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
                      value={bankstatement}
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
                      value={incomeTaxReturnFile}
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
                      value={salarySlipOrOfferLetter}
                      onChange={(e) =>
                        setSalarySlipOrOfferLetter(e.target.value)
                      }
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
                      value={buisness}
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
                      value={PropertyPaper}
                      onChange={(e) => setPropertyPaper(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="text-center mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  style={{
                    backgroundColor: "#121942",
                    border: "none",
                    color: "#fff",
                  }}
                >
                  Submit Application
                </Button>
              </div>
            </Form>
          </Box>
        </Modal>
      </AdminLayout>
    </>
  );
}
