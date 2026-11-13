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
import { Box, Button, Modal, Typography } from "@mui/material";
import swal from "sweetalert";
import EditIcon from "@mui/icons-material/Edit";
import { Container, Form, Row, Col } from "react-bootstrap";
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

export default function GoldLoan() {
  // States
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  //  Life cycle
  useEffect(() => {
    getGoldLoan();
  }, []);

  // Functions
  const getGoldLoan = async () => {
    const res = await getApihandler("/getAllGoldLoan");
    console.log("res", res);
    if (res.message === "Gold loan applications get successfully") {
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

  // ********** update api *********
  const [loanid, setLoanId] = useState("");
  // console.log("loan id is ---->", loanid);
  const [index, setIndex] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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

  useEffect(() => {
    if (index !== "") {
      const {
        fullName,
        fatherOrHusbandName,
        motherName,
        dateOfBirth,
        permanentAddress,
        contactNumber,
        email,
        occupationOrBusiness,
        monthlyOrAnnualIncome,
        goldType,
        goldWeightInGrams,
        goldPurity,
        loanAmountRequired,
        loanPurpose,
        preferredRepaymentTenure,
      } = data[index] || {};

      setOpen(true);
      setFullName(fullName || "");
      setFatherOrHusbandName(fatherOrHusbandName || "");
      setMotherName(motherName || "");
      setDateOfBirth(dateOfBirth || "");
      setPermanentAddress(permanentAddress || "");
      setContactNumber(contactNumber || "");
      setEmail(email || "");
      setOccupationOrBusiness(occupationOrBusiness || "");
      setMonthlyOrAnnualIncome(monthlyOrAnnualIncome || "");
      setGoldType(goldType || "");
      setGoldWeightInGrams(goldWeightInGrams || "");
      setGoldPurity(goldPurity || "");
      setLoanAmountRequired(loanAmountRequired || "");
      setLoanPurpose(loanPurpose || "");
      setPreferredRepaymentTenure(preferredRepaymentTenure || "");
    }
  }, [index, data]);
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

    const res = await putApihandler(`/updateGoldLoan/${loanid}`, data);

    console.log("update home loan api res is --->", res);
    if (res.message === "Gold loan application updated successfully") {
      swal({
        title: "Gold loan application updated successfully",
        icon: "success",
      });
      setOpen(false);
      getGoldLoan();
    }
  };

  return (
    <>
      <AdminLayout>
        <h1>Gold Loan</h1>
        {/* Data table */}

        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Link to="/add-GoldLoan">
            <Button
              variant="contained"
              sx={{ textTransform: "capitalize", backgroundColor: "#121942" }}
            >
              Add Gold Loan
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
                <StyledTableCell>Email</StyledTableCell>
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
                    <StyledTableCell>{row.email}</StyledTableCell>
                    <StyledTableCell>
                      <Link to={`/gold-loan-detail/${row._id}`}>
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
                      onChange={(e) =>
                        setPreferredRepaymentTenure(e.target.value)
                      }
                      placeholder="e.g. 12 Months"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="text-center">
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
