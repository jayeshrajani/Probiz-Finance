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
import { getApihandler, postApihandler, putApihandler } from "../Apihandler";
import AdminLayout from "../Layout/AdminLayout";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import swal from "sweetalert";
import EditIcon from "@mui/icons-material/Edit";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
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

export default function InvestmentPlan() {
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const res = await getApihandler("/getAllInvestment");
    console.log("res", res);
    if (res.status === 200) {
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
  //  ********** add insurannce ***********
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);

  const [loantype, setLoanType] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileno, setMobileNo] = useState("");
  const [dob, setDob] = useState("");
  const [index, setIndex] = useState("");
  const [loanid, setLoanId] = useState("");
  const AddInsurance = async () => {
    const data = {
      loan_Type: loantype,
      first_Name: firstname,
      last_Name: lastname,
      email: email,
      mobile_no: mobileno,
      dateOfBirth: dob,
    };
    const res = await postApihandler("/addInvestment", data);

    console.log("add loa insurance api res is --->", res);
    if (res.message === "Investment data added successfully") {
      swal({
        title: "Investment data added successfully",
        icon: "success",
      });
      setOpen(false);
      getUser();
    }
  };

  // *********** update insurance **************
  useEffect(() => {
    if (index !== "") {
      const {
        loan_Type,
        first_Name,
        last_Name,
        email,
        mobile_no,
        dateOfBirth,
      } = data[index];
      setOpen1(true);
      setLoanType(loan_Type || "");
      setFirstName(first_Name || "");
      setLastName(last_Name || "");
      setEmail(email || "");
      setMobileNo(mobile_no || "");
      setDob(dateOfBirth || "");
    }
  }, [data, index]);
  const UpdateInsurance = async () => {
    const data = {
      loan_Type: loantype,
      first_Name: firstname,
      last_Name: lastname,
      email: email,
      mobile_no: mobileno,
      dateOfBirth: dob,
    };

    const res = await putApihandler(`/updateInvestment/${loanid}`, data);
    // console.log("update api res is --->", res);
    if (res.status === 200) {
      swal({
        title: "Investment Update Successfully",
        icon: "success",
      }).then(() => {
        setOpen1(false);
        getUser();
      });
    }
  };

  return (
    <>
      <AdminLayout>
        <h1>Investment Plan</h1>
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Button
            onClick={handleOpen}
            sx={{
              backgroundColor: "#121942",
              color: "#fff",
              marginBottom: "10px",
              textTransform: "capitalize",
            }}
          >
            Add Investment Plan
          </Button>
        </div>
        <TableContainer component={Paper} sx={{ maxWidth: 1200 }}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: "10%" }}>Sr no.</StyledTableCell>
                <StyledTableCell sx={{ width: "20%" }}>Name</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Mobile No.</StyledTableCell>
                <StyledTableCell>DOB</StyledTableCell>
                <StyledTableCell>Loan Type</StyledTableCell>
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
                    <StyledTableCell>
                      {row.first_Name}
                      {row.last_Name}
                    </StyledTableCell>
                    <StyledTableCell>{row.email}</StyledTableCell>
                    <StyledTableCell>{row.mobile_no}</StyledTableCell>
                    <StyledTableCell>{row.dateOfBirth}</StyledTableCell>
                    <StyledTableCell>{row.loan_Type}</StyledTableCell>
                    <StyledTableCell>
                      <EditIcon
                        onClick={() => {
                          setLoanId(row._id);
                          setIndex(index);
                          // setOpen(true);
                        }}
                      />
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
        {/* ****** add insurance ********* */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Investment Plan
            </Typography>
            <label>Add Loan Type</label>
            <select
              value={loantype}
              onChange={(e) => setLoanType(e.target.value)}
              className="form-control mt-2"
            >
              <option>Investment Plans with High Returns</option>
              <option>Market Linked Investment Plans (ULIP)</option>
              <option>Investment Plans for NRIs</option>
              <option>SIP Calculator</option>
              <option>Capital Guarantee Plans</option>
              <option>Child Plans</option>
              <option>Pension Plans</option>
              <option>Guaranteed Return Plans</option>
              <option>Tax Saving Investments</option>
              <option>SIP (Systematic Investment Plan)</option>
              <option>Endowment Policy</option>
              <option>Money Back Policy</option>
              <option>Annuity Plans</option>
              <option>Income Tax Calculator</option>
            </select>
            <div className="mt-2">
              <label>First Name</label>
              <input
                placeholder=" First Name"
                type="text"
                className="form-control"
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label>Last Name</label>
              <input
                placeholder=" Last Name"
                type="text"
                className="form-control"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label>Email</label>
              <input
                placeholder="Email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label>Mobile Number</label>
              <input
                placeholder="Mobile Number"
                type="tel:"
                className="form-control"
                value={mobileno}
                onChange={(e) => setMobileNo(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label>Date Of Birth</label>
              <input
                type="date"
                placeholder="Date of Birth"
                className="form-control"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <Button
              sx={{
                backgroundColor: "#121942",
                color: "#fff",
                marginBottom: "10px",
                textTransform: "capitalize",
                marginTop: "20px",
              }}
              onClick={AddInsurance}
            >
              Add Investment Plan
            </Button>
          </Box>
        </Modal>

        {/* ****** update insurance ********* */}
        <Modal
          open={open1}
          onClose={handleClose1}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Update Investment Plan
            </Typography>
            <label>Add Loan Type</label>
            <select
              value={loantype}
              onChange={(e) => setLoanType(e.target.value)}
              className="form-control mt-2"
            >
              <option>Investment Plans with High Returns</option>
              <option>Market Linked Investment Plans (ULIP)</option>
              <option>Investment Plans for NRIs</option>
              <option>SIP Calculator</option>
              <option>Capital Guarantee Plans</option>
              <option>Child Plans</option>
              <option>Pension Plans</option>
              <option>Guaranteed Return Plans</option>
              <option>Tax Saving Investments</option>
              <option>SIP (Systematic Investment Plan)</option>
              <option>Endowment Policy</option>
              <option>Money Back Policy</option>
              <option>Annuity Plans</option>
              <option>Income Tax Calculator</option>
            </select>
            <div className="mt-2">
              <label>First Name</label>
              <input
                placeholder=" First Name"
                type="text"
                className="form-control"
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label>Last Name</label>
              <input
                placeholder=" Last Name"
                type="text"
                className="form-control"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label>Email</label>
              <input
                placeholder="Email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label>Mobile Number</label>
              <input
                placeholder="Mobile Number"
                type="tel:"
                className="form-control"
                value={mobileno}
                onChange={(e) => setMobileNo(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label>Date Of Birth</label>
              <input
                type="date"
                placeholder="Date of Birth"
                className="form-control"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <Button
              sx={{
                backgroundColor: "#121942",
                color: "#fff",
                marginBottom: "10px",
                textTransform: "capitalize",
                marginTop: "20px",
              }}
              onClick={UpdateInsurance}
            >
              Update Investment Plan
            </Button>
          </Box>
        </Modal>
      </AdminLayout>
    </>
  );
}
