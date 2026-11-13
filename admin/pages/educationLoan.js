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
import { Box, Button, Modal } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import swal from "sweetalert";
import { Container, Form, Row, Col } from "react-bootstrap";
import Typography from "@mui/material/Typography";
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

export default function EducationLoan() {
  // States
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  //  Life cycle
  useEffect(() => {
    getEducationLoan();
  }, []);

  // Functions
  const getEducationLoan = async () => {
    const res = await getApihandler("/getAllEducationLoan");
    console.log("res", res);
    if (res.message === "All education loan applications get successfully") {
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

  // ********** update api **************
  const [loanid, setLoanId] = useState("");
  // console.log("loan id is ---->", loanid);
  const [index, setIndex] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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

  useEffect(() => {
    if (index !== "") {
      const {
        fullName,
        fatherOrHusbandName,
        dateOfBirth,
        permanentAddress,
        contactNumber,
        email,
        courseName,
        institutionName,
        institutionAddress,
        admissionDate,
        courseDuration,
        totalFees,
        loanAmountRequired,
        occupationOrBusiness,
        monthlyOrAnnualIncome,
        coApplicantName,
        coApplicantFatherOrHusbandName,
        coApplicantDateOfBirth,
        coApplicantRelationship,
        coApplicantAddress,
        coApplicantContact,
        coApplicantIncome,
        collateralType,
        collateralLocation,
        collateralMarketValue,
        admissionLetter,
        previousMarkSheets,
        feeStructure,
      } = data[index] || {};

      setOpen(true);
      setFullName(fullName || "");
      setFatherOrHusbandName(fatherOrHusbandName || "");
      setDateOfBirth(dateOfBirth || "");
      setPermanentAddress(permanentAddress || "");
      setContactNumber(contactNumber || "");
      setEmail(email || "");
      setCourseName(courseName || "");
      setInstitutionName(institutionName || "");
      setInstitutionAddress(institutionAddress || "");
      setAdmissionDate(admissionDate || "");
      setCourseDuration(courseDuration || "");
      setTotalFees(totalFees || "");
      setLoanAmountRequired(loanAmountRequired || "");
      setOccupationOrBusiness(occupationOrBusiness || "");
      setMonthlyOrAnnualIncome(monthlyOrAnnualIncome || "");
      setCoApplicantName(coApplicantName || "");
      setCoApplicantFatherOrHusbandName(coApplicantFatherOrHusbandName || "");
      setCoApplicantDateOfBirth(coApplicantDateOfBirth || "");
      setCoApplicantRelationship(coApplicantRelationship || "");
      setCoApplicantAddress(coApplicantAddress || "");
      setCoApplicantContact(coApplicantContact || "");
      setCoApplicantIncome(coApplicantIncome || "");
      setCollateralType(collateralType || "");
      setCollateralLocation(collateralLocation || "");
      setCollateralMarketValue(collateralMarketValue || "");
      setAdmissionLetter(admissionLetter || "");
      setPreviousMarkSheets(previousMarkSheets || "");
      setFeeStructure(feeStructure || "");
    }
  }, [index, data]);
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
    const res = await putApihandler(`/updateEducationLoan/${loanid}`, formData);

    console.log("update home loan api res is --->", res);
    if (res.message === "Application updated successfully") {
      swal({
        title: "Application updated successfully",
        icon: "success",
      });
      setOpen(false);
      getEducationLoan();
    }
  };

  return (
    <>
      <AdminLayout>
        <h1>Education Loan</h1>
        {/* Data table */}
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Link to="/add-education-loan">
            <Button
              variant="contained"
              sx={{ textTransform: "capitalize", backgroundColor: "#121942" }}
            >
              Add Education Loan
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
                      <Link to={`/education-loan-detail/${row._id}`}>
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
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ textAlign: "left" }}>
                      Full Name
                    </Form.Label>
                    <Form.Control
                      name="fullName"
                      value={fullName}
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
                      value={fatherOrHusbandName}
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
                      value={dateOfBirth}
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
                      value={permanentAddress}
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
                      value={contactNumber}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ textAlign: "left" }}>
                      Course Name
                    </Form.Label>
                    <Form.Control
                      name="courseName"
                      value={courseName}
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
                      value={institutionName}
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
                      value={institutionAddress}
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
                      value={admissionDate}
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
                      value={courseDuration}
                      onChange={(e) => setCourseDuration(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ textAlign: "left" }}>
                      Total Fees
                    </Form.Label>
                    <Form.Control
                      name="totalFees"
                      value={totalFees}
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
                      value={loanAmountRequired}
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
                      value={occupationOrBusiness}
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
                      value={monthlyOrAnnualIncome}
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
                      value={coApplicantName}
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
                      value={coApplicantFatherOrHusbandName}
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
                      value={coApplicantDateOfBirth}
                      onChange={(e) =>
                        setCoApplicantDateOfBirth(e.target.value)
                      }
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
                      value={coApplicantRelationship}
                      onChange={(e) =>
                        setCoApplicantRelationship(e.target.value)
                      }
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
                      value={coApplicantAddress}
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
                      value={coApplicantContact}
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
                      value={coApplicantIncome}
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
                      value={collateralType}
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
                      value={collateralLocation}
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
                      value={collateralMarketValue}
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
                      value={admissionLetter}
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
                      value={previousMarkSheets}
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
                      value={feeStructure}
                      onChange={(e) => setFeeStructure(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="text-center mb-5">
                <Button
                  type="submit"
                  variant="primary"
                  sx={{ backgroundColor: "#121942", color: "#fff" }}
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
