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
import { Container, Form, Row, Col } from "react-bootstrap";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import EditIcon from "@mui/icons-material/Edit";
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

export default function BalanceTransfer() {
  // States
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  //  Life cycle
  useEffect(() => {
    getBalanceTransfer();
  }, []);

  // Functions
  const getBalanceTransfer = async () => {
    const res = await getApihandler("/getBalancetransfersProperty");
    console.log("res", res);
    if (res.message === "Balance transfer details get successfully.") {
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
  const [loanAmount, setLoanAmount] = useState("");
  const [profession, setProfession] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [incomeTaxReturn, setIncomeTaxReturn] = useState("");
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
  const [PropertyPaper, setPropertyPaper] = useState("");
  const [currentloan, setCurrentLoan] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [officeShopProof, setOfficeShopProof] = useState("");
  const [buisnessproof, setBuisnessProof] = useState("");
  const [loanAccountStatement, setLoanAccountStatement] = useState("");
  const [listofdocument, setListOfDocument] = useState("");
  const [foreClosureLetter, setForeClosureLetter] = useState("");
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
        loanAmount,
        noOfStallmentCurrentLoan,
        profession,
        incomeType,
        monthlyIncome,
        incomeTaxReturn,
        cibilScore,
        aadharFront,
        aadharBack,
        panCard,
        electricityBillOrRentAgreement,
        officeShopProof,
        propertyPhotoFront,
        propertyPhotoInside,
        bankStatement,
        incomeTaxReturnFile,
        businessProof,
        loanAccountStatement,
        listOfDocuments,
        foreclosureLetter,
      } = data[index] || {};

      setOpen(true);
      setName(fullName || "");
      setDob(dateOfBirth || "");
      setAddress(address || "");
      setContactNumber(contactNumber || "");
      setAlternateContact(alternateContact || "");
      setPropertyType(propertyType || "");
      setLoanAmount(loanAmount || "");
      setCurrentLoan(noOfStallmentCurrentLoan || "");
      setProfession(profession || "");
      setIncomeType(incomeType || "");
      setMonthlyIncome(monthlyIncome || "");
      setIncomeTaxReturn(incomeTaxReturn || "");
      setAadharFront(aadharFront || "");
      setAadharBack(aadharBack || "");
      setPanCard(panCard || "");
      setElectricityBill(electricityBillOrRentAgreement || "");
      setPropertyFront(propertyPhotoFront || "");
      setPropertyInside(propertyPhotoInside || "");
      setBankStatement(bankStatement || "");
      setIncomeTaxReturnFile(incomeTaxReturnFile || "");
      setSalarySlipOrOfferLetter(salarySlipOrOfferLetter || "");
      setPropertyPaper(PropertyPaper || "");
      setCibilScore(cibilScore || "");
      setOfficeShopProof(officeShopProof || "");
      setBuisnessProof(businessProof || "");
      setLoanAccountStatement(loanAccountStatement || "");
      setListOfDocument(listOfDocuments || "");
      setForeClosureLetter(foreclosureLetter || "");
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
    formData.append("loanAmount", loanAmount);
    formData.append("profession", profession);
    formData.append("incomeType", incomeType);
    formData.append("monthlyIncome", monthlyIncome);
    formData.append("incomeTaxReturn", incomeTaxReturn);
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
    formData.append("propertyPaper", PropertyPaper);
    formData.append("noOfStallmentCurrentLoan", currentloan);
    formData.append("cibilScore", cibilScore);
    formData.append("officeShopProof", officeShopProof);
    formData.append("businessProof", buisnessproof);
    formData.append("loanAccountStatement", loanAccountStatement);
    formData.append("listOfDocuments", listofdocument);
    formData.append("foreclosureLetter", foreClosureLetter);

    const res = await putApihandler(
      `/updateBalanceTransferDetail/${loanid}`,
      formData
    );
    console.log("update home loan api res is --->", res);
    if (res.message === "Balance transfer details updated successfully") {
      swal({
        title: "Balance transfer details updated successfully",
        icon: "success",
      });
      getBalanceTransfer();
      setOpen(false);
    }
  };

  return (
    <>
      <AdminLayout>
        <h1>Balance Transfer</h1>
        {/* Data table */}
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Link to="/add-balancetransfer-loan">
            <Button
              variant="contained"
              sx={{ textTransform: "capitalize", backgroundColor: "#121942" }}
            >
              Add Balance Transfer
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
                      <Link to={`/balance-transfer-detail/${row._id}`}>
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
                      <option value="Flat">Flat</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="noOfStallmentCurrentLoan">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>No Of Stallment CurrentLoan</Form.Label>
                    </div>
                    <Form.Control
                      type="number"
                      name="noOfStallmentCurrentLoan"
                      value={currentloan}
                      onChange={(e) => setCurrentLoan(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="Cibil Score">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>Cibil Score</Form.Label>
                    </div>
                    <Form.Control
                      type="number"
                      name="Cibil Score"
                      value={cibilScore}
                      onChange={(e) => setCibilScore(e.target.value)}
                    />
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
                      <option value="Job">Job </option>
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
                      <option value="Monthly">Cash</option>
                      <option value="Yearly">Account</option>
                      <option value="Yearly">Both</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="incomeTaxReturn">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>Income Tax Return</Form.Label>
                    </div>
                    <Form.Select
                      name="incomeTaxReturn"
                      value={incomeTaxReturn}
                      onChange={(e) => setIncomeTaxReturn(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Monthly">Yes</option>
                      <option value="Yearly">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="officeShopProof">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>Office Shop Proof</Form.Label>
                    </div>
                    <Form.Control
                      type="file"
                      name="officeShopProof"
                      value={officeShopProof}
                      onChange={(e) => setOfficeShopProof(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="listOfDocuments">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>List Of Documents</Form.Label>
                    </div>
                    <Form.Control
                      type="file"
                      name=" listOfDocuments"
                      value={listofdocument}
                      onChange={(e) => setListOfDocument(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="foreclosureLetter">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>Fore Closure Letter</Form.Label>
                    </div>
                    <Form.Control
                      type="file"
                      name="foreclosureLetter"
                      value={foreClosureLetter}
                      onChange={(e) => setForeClosureLetter(e.target.value)}
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
                  <Form.Group controlId="LoanAccountStatement">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>Loan Account Statement</Form.Label>
                    </div>
                    <Form.Control
                      type="file"
                      name="Loan Account Statement"
                      value={loanAccountStatement}
                      onChange={(e) => setLoanAccountStatement(e.target.value)}
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
                  <Form.Group controlId="Business Proof">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>Business Proof</Form.Label>
                    </div>
                    <Form.Control
                      type="file"
                      name="Business Proof"
                      value={buisnessproof}
                      onChange={(e) => setBuisnessProof(e.target.value)}
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
                    color: "white",
                  }}
                >
                  Add Balance Transfer Loan
                </Button>
              </div>
            </Form>
          </Box>
        </Modal>
      </AdminLayout>
    </>
  );
}
