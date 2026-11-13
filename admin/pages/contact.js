import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getApihandler } from "../Apihandler";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function Contact() {
  const [data, setData] = useState([]);
  console.log("data is ------>", data);
  useEffect(() => {
    getAllContact();
  }, []);
  const getAllContact = async () => {
    const res = await getApihandler("/getContactUs");
    console.log("get all contacts api res is --->", res);
    if (res.message === "Contacts get successfully") {
      setData(res.data);
    }
  };
  return (
    <AdminLayout>
      <h4>Contact us</h4>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Email</TableCell>
              <TableCell align="right">Mobile Number</TableCell>
              <TableCell align="right">Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.email}</TableCell>
                <TableCell align="right">{row.mobile_no}</TableCell>
                <TableCell align="right">{row.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminLayout>
  );
}
