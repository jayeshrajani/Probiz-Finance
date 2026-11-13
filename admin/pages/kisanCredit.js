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
import { Container, Form, Row, Col } from "react-bootstrap";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import Modal from "@mui/material/Modal";

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

export default function KisanCreditCard() {
  // States
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  //  Life cycle
  useEffect(() => {
    getKisanCreditCardLoan();
  }, []);

  // Functions
  const getKisanCreditCardLoan = async () => {
    const res = await getApihandler("/getAllkisanloans");
    console.log("res", res);
    if (
      res.message ===
      "All Kisan Credit Loan applications retrieved successfully"
    ) {
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

  // ********* update api **********
  const [loanid, setLoanId] = useState("");
  // console.log("loan id is ---->", loanid);
  const [index, setIndex] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [residenceType, setResidenceType] = useState("");
  const [TotalLand, setTotalLand] = useState("");
  const [pawti, setPawti] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [incomeTaxReturn, setIncomeTaxReturn] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [aadharfront, setAadharFront] = useState("");
  const [aadharback, setAadharBack] = useState("");
  const [PanCard, setPanCard] = useState("");
  const [electricityBill, setElectricityBill] = useState("");
  const [incomeTaxReturnFile, setIncomeTaxReturnFile] = useState("");
  const [bankstatement, setBankStatement] = useState("");
  const [pawtidocument, setPawtiDocument] = useState("");
  const [khasracopy, setKhasraCopy] = useState("");

  useEffect(() => {
    if (index !== "") {
      const {
        fullName,
        dateOfBirth,
        address,
        contactNumber,
        alternateContactNumber,
        residenceType,
        totalLand,
        pawti,
        incomeType,
        monthlySalary,
        incomeTaxReturn,
        cibilScore,
        aadharFront,
        aadharBack,
        panCard,
        electricityBill,
        bankStatement,
        incomeTaxReturnFile,
        pawtiDocument,
        khasraCopy,
      } = data[index] || {};

      setOpen(true);
      setName(fullName || "");
      setDob(dateOfBirth || "");
      setAddress(address || "");
      setContactNumber(contactNumber || "");
      setAlternateContact(alternateContactNumber || "");
      setResidenceType(residenceType || "");
      setTotalLand(totalLand || "");
      setPawti(pawti || "");
      setIncomeType(incomeType || "");
      setMonthlyIncome(monthlySalary || "");
      setIncomeTaxReturn(incomeTaxReturn || "");
      setCibilScore(cibilScore || "");
      setAadharFront(aadharFront || "");
      setAadharBack(aadharBack || "");
      setPanCard(panCard || "");
      setElectricityBill(electricityBill || "");
      setBankStatement(bankStatement || "");
      setIncomeTaxReturnFile(incomeTaxReturnFile || "");
      setPawtiDocument(pawtiDocument || "");
      setKhasraCopy(khasraCopy || "");
    }
  }, [index, data]);
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
    const res = await putApihandler(
      `/updatekisanCreditLoanApplication/${loanid}`,
      formData
    );

    console.log("update home loan api res is --->", res);
    if (res.message === "Application updated successfully") {
      swal({
        title: "Application updated successfully",
        icon: "success",
      });
      setOpen(false);
      getKisanCreditCardLoan();
    }
  };

  return (
    <>
      <AdminLayout>
        <h1>Kisan Credit Card</h1>
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Link to="/add-kisancreditcard">
            <Button
              variant="contained"
              sx={{ textTransform: "capitalize", backgroundColor: "#121942" }}
            >
              Add Kisan Credit Card
            </Button>
          </Link>
        </div>
        {/* Data table */}
        <TableContainer component={Paper} sx={{ maxWidth: 1200 }}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: "10%" }}>Sr no.</StyledTableCell>
                <StyledTableCell sx={{ width: "20%" }}>Name</StyledTableCell>
                <StyledTableCell>DOB</StyledTableCell>
                <StyledTableCell>Contact</StyledTableCell>
                <StyledTableCell>Monthly Income</StyledTableCell>
                <StyledTableCell>Cibil Score</StyledTableCell>
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
                    <StyledTableCell>{row.monthlySalary}</StyledTableCell>
                    <StyledTableCell>{row.cibilScore}</StyledTableCell>
                    <StyledTableCell>
                      <Link to={`/kisan-credit-card-detail/${row._id}`}>
                        <RemoveRedEyeIcon />
                      </Link>
                      <Link>
                        <EditIcon
                          sx={{ marginLeft: "10px" }}
                          onClick={() => {
                            setLoanId(row._id);
                            setIndex(index);
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
              Edit Project Funding Loan
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
                  <Form.Group controlId="TotalLand(in acre)">
                    <div style={{ textAlign: "left" }}>
                      <Form.Label>Total Land (in acre)</Form.Label>
                    </div>
                    <Form.Control
                      name="TotalLand(in acre)"
                      value={TotalLand}
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
                      value={residenceType}
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
                      value={loanAmount}
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
                      value={pawti}
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
                      type="file"
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
                      type="file"
                      name="electricity bill"
                      value={electricityBill}
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
                      value={incomeTaxReturnFile}
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
                      value={bankstatement}
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
                      value={pawtidocument}
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
                      value={khasracopy}
                      onChange={(e) => setKhasraCopy(e.target.value)}
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
