import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { getApihandler, postApihandler, putApihandler } from "../Apihandler";
import EditIcon from "@mui/icons-material/Edit";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Container, Form, Row, Col } from "react-bootstrap";
import swal from "sweetalert";
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

export default function BalanceTopUpLoan() {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [index, setIndex] = useState("");
  const [data, setData] = useState([]);
  const [loanid, setLoanId] = useState("");
  useEffect(() => {
    getAllBalanceTop();
  }, []);
  const getAllBalanceTop = async () => {
    const res = await getApihandler("/getAllBalancetransfersTopUp");
    console.log("getAllBalance api res--->", res);
    if (res.success === true) {
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
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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

  useEffect(() => {
    if (index !== "") {
      const {
        fullName,
        dateOfBirth,
        address,
        contactNumber,
        alternateContact,
        residenceType,
        currentLoanAmount,
        currentLoanInstallmentsPaid,
        loanAmountRequired,
        profession,
        incomeType,
        totalMonthlyIncome,
        incomeTaxReturn,
        cibilScore,
        aadharFront,
        aadharBack,
        panCard,
        electricityOrRentAgreement,
        officeShopElectricityOrRent,
        propertyPhotoFront,
        propertyPhotoInside,
        bankStatementLastYear,
        incomeTaxReturnFile,
        forBusinessDocuments,
        loanAccountStatement,
        listOfDocumentsByBank,
        foreclosureLetter,
      } = data[index];
      setName(fullName || "");
      setDob(dateOfBirth || "");
      setAddress(address || "");
      setContactNumber(contactNumber || "");
      setAlternateContactNumber(alternateContact || "");
      setResidenceType(residenceType || "");
      setCurrentLoanAmount(currentLoanAmount || "");
      setCurrentLoanAmountInstallMent(currentLoanInstallmentsPaid || "");
      setLoanAmountRequired(loanAmountRequired || "");
      setProfession(profession || "");
      setIncomeType(incomeType || "");
      setMonthlyIncome(totalMonthlyIncome || "");
      setIncomeTaxReturn(incomeTaxReturn || "");
      setCibilScore(cibilScore || "");
      setAadharFront(aadharFront || "");
      setAadharBack(aadharBack || "");
      setPanCard(panCard || "");
      setElectricityBill(electricityOrRentAgreement || "");
      setOfficePhoto(officeShopElectricityOrRent || "");
      setPropertyFront(propertyPhotoFront || "");
      setPropertyInside(propertyPhotoInside || "");
      setBankStatement(bankStatementLastYear || "");
      setIncomeTaxReturnFile(incomeTaxReturnFile || "");
      setBuisnessDocument(forBusinessDocuments || "");
      setLoanAccountStatement(loanAccountStatement || "");
      setListDocument(listOfDocumentsByBank || "");
      setForClosureLetter(foreclosureLetter || "");
      setOpen(true);
    }
  }, [data, index]);

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

    const res = await putApihandler(
      `/updateBalanceTransferTopUpDetail/${loanid}`,
      formData
    );
    console.log("update balance transfer loan is ---->", res);
    if (res.message === "Application updated successfully!") {
      swal({
        title: "Application updated successfully!",
        icon: "success",
      });
      setOpen(false);
      getAllBalanceTop();
    }
  };

  return (
    <AdminLayout>
      <h4>Balance top up loan</h4>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <Link to="/addbalancetransfertopuploan">
          <Button
            sx={{
              backgroundColor: "#121942",
              color: "#fff",
              textTransform: "capitalize",
            }}
          >
            Add Balance TopUp Loan
          </Button>
        </Link>
      </div>
      <TableContainer
        component={Paper}
        sx={{ maxWidth: 1200, marginTop: "20px" }}
      >
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
                    <Link to={`/balancetranfertopuploandetail/${row._id}`}>
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

      {/* ******** modal ********* */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update Balance Top Up Loan
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
                    onChange={(e) => setAlternateContactNumber(e.target.value)}
                  />
                </Form.Group>
              </Col>
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
                    value={residenceType}
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
                    value={currentLoanAmountInstallMent}
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
                    value={loanAmountRequired}
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
                    value={currentLoanAmount}
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
                    value={monthlyincome}
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
                    <Form.Label>Loan Account Statement</Form.Label>
                  </div>
                  <Form.Select
                    name="loanaccountstatement"
                    value={loanAccountStatement}
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
              <Col md={6}>
                <Form.Group controlId="incomeTaxReturn">
                  <div style={{ textAlign: "left" }}>
                    <Form.Label>Aadhar Front</Form.Label>
                  </div>
                  <Form.Control
                    type="file"
                    name="Aadhar Front"
                    value={aadharFront}
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
                    value={aadharBack}
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
                    value={panCard}
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
                    <Form.Label>For Closure Letter</Form.Label>
                  </div>
                  <Form.Control
                    type="file"
                    name="For Closure Letter"
                    value={forClosureletter}
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
                    value={bankStatement}
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
                <Form.Group controlId="listdocument">
                  <div style={{ textAlign: "left" }}>
                    <Form.Label>List Document</Form.Label>
                  </div>
                  <Form.Control
                    type="file"
                    name="list document"
                    value={listDocument}
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
                    value={buisnessDocument}
                    onChange={(e) => setBuisnessDocument(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="OfficePhoto">
                  <div style={{ textAlign: "left" }}>
                    <Form.Label>Office Photo</Form.Label>
                  </div>
                  <Form.Control
                    type="file"
                    name="Office Photo"
                    value={officePhoto}
                    onChange={(e) => setOfficePhoto(e.target.value)}
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
  );
}
