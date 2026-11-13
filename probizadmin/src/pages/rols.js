import React, { useEffect, useState } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { getApihandler } from '../Apihandler';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { styled } from "@mui/material/styles";
import { Button } from '@mui/material';

// const style = {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     width: 400,
//     bgcolor: "background.paper",
//     border: "2px solid #000",
//     boxShadow: 24,
//     p: 4,
// };

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
export default function Rols() {
  const [data, setData] = useState([]);
  console.log("data==>",data);
  
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  useEffect(() => {
    getRolls();
  }, []);

  const getRolls = async () => {
    const res = await getApihandler("/getAllRolesByAdmin");
    console.log("res", res);
    if (res.message === "Roles get successfully") {
      setData(res.data);
    }
  }
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
        <h1>Account / Sales</h1>
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Button
            // onClick={handleOpen}
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
                        <TableHead >
                            <TableRow >
                                <StyledTableCell sx={{ width: "10%" }}>Sr no.</StyledTableCell>
                                <StyledTableCell sx={{ width: "20%" }}>Roll Name</StyledTableCell>
                                <StyledTableCell sx={{ width: "20%" }}>Permission</StyledTableCell>
                           
                               
                            </TableRow>
                        </TableHead>
                        <TableBody >
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => (
                                    <StyledTableRow key={row._id} >
                                        <StyledTableCell component="th" scope="row">
                                            {page * rowsPerPage + index + 1}
                                        </StyledTableCell>
                                        <StyledTableCell>{row.rollName}</StyledTableCell>
                                        <StyledTableCell>{row.permission.map((val)=>{
                                                  return(
                                                    <>
                                                    <StyledTableRow >
                                                    <StyledTableCell>{val.tabName}</StyledTableCell>
                                                    <StyledTableCell>{val.tabAcess.map((v)=>{
                                                          return(
                                                            <>
                                                            <StyledTableCell>{v}</StyledTableCell>
                                                            </>
                                                          )
                                                    })}</StyledTableCell>
                                                    </StyledTableRow>
                                                    </>
                                                  )
                                        }
                                        )}</StyledTableCell>
                                       
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

      </AdminLayout>
    </div>
  )
}
