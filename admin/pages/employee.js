import React, { useEffect, useState } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { Box, Button, Modal, Typography } from '@mui/material'
import { getApihandler, postApihandler } from '../Apihandler';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { styled } from "@mui/material/styles";

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

export default function Employee() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [data, setData] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    // States for employee fields
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [roll, setRoll] = useState('');
    const [password, setPassword] = useState('');
    const [employeeId, setEmployeeId] = useState('');

    useEffect(() => {
        getEmployee();
    }, []);

    const getEmployee = async () => {
        const res = await getApihandler("/getAllEmployee");
        console.log("res", res);

        if (res.status === 200) {
            setData(res.data);
        }
    };
    const handleSubmit = async () => {
        const data = { name, mobile, email, roll, password, employeeId };
        const res = await postApihandler("/addEmployee", data);
        console.log("res", res);

        if (res.status === 200) {
            alert('Employee added successfully');
            handleClose();
        } else {
            alert(res.message || 'Something went wrong');
        }
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10)); // Un-commented to set rows per page
        setPage(0);
    };

    return (
        <div>
            <AdminLayout>
                <h1>Employee</h1>
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
                        Add Employee
                    </Button>
                </div>

                {/* *****  table **** */}

                <TableContainer component={Paper} sx={{ maxWidth: 1200 }}>
                    <Table aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: "10%" }}>Sr no.</StyledTableCell>
                                <StyledTableCell sx={{ width: "20%" }}>Employee Id</StyledTableCell>
                                <StyledTableCell sx={{ width: "20%" }}>Employee Name</StyledTableCell>
                                <StyledTableCell>Email</StyledTableCell>
                                <StyledTableCell>Mobile Number</StyledTableCell>
                                <StyledTableCell>Roll</StyledTableCell>
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
                                        <StyledTableCell>{row.employeeId}</StyledTableCell>
                                        <StyledTableCell>{row.name}</StyledTableCell>
                                        <StyledTableCell>{row.email}</StyledTableCell>
                                        <StyledTableCell>{row.mobile}</StyledTableCell>
                                        <StyledTableCell>{row.roll}</StyledTableCell>
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
                            Add Employee
                        </Typography>

                        <div className="mt-2">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="mt-2">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mt-2">
                            <label>Mobile</label>
                            <input
                                type="tel"
                                className="form-control"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                        </div>

                        <div className="mt-2">
                            <label>Role</label>
                            <input
                                type="text"
                                className="form-control"
                                value={roll}
                                onChange={(e) => setRoll(e.target.value)}
                            />
                        </div>

                        <div className="mt-2">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="mt-2">
                            <label>Employee ID</label>
                            <input
                                type="text"
                                className="form-control"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
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
                            onClick={handleSubmit}
                        >
                            Add Employee
                        </Button>
                    </Box>
                </Modal>

            </AdminLayout>
        </div>
    )
}
