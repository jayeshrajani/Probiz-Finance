import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getApihandler, postApihandler, putApihandler } from "../Apihandler";
import swal from "sweetalert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Modal, Typography } from "@mui/material";

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
export default function GovernmentBuisnessServices() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  //   *********** add api **********
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileno, setMobileNo] = useState("");
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);
  const [index, setIndex] = useState("");
  const [servicesid, setServicesId] = useState("");
  const AddCaService = async () => {
    const data = {
      name: name,
      email: email,
      mobile_no: mobileno,
      message: message,
    };
    console.log("data is --->", data);
    const res = await postApihandler("/addGovernmentBusinessService", data);

    console.log("add ca service api res--->", res);
    if (res.message === "Government Business Service added successfully") {
      swal({
        icon: "success",
        title: "Government Business Service added successfully",
      });
      setOpen(false);
    }
  };

  //   ******* get api ***********
  useEffect(() => {
    getServices();
  }, []);
  const getServices = async () => {
    const res = await getApihandler("/getAllGovernmentBusinessService");

    console.log("get services api res --->", res);
    setData(res.data);
  };

  //   ******** update api **********
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);
  useEffect(() => {
    if (index !== "") {
      const { name, email, mobile_no, message } = data[index];
      setOpen1(true);
      setName(name || "");
      setEmail(email || "");
      setMobileNo(mobile_no || "");
      setMessage(message || "");
    }
  }, [data, index]);

  const updateServices = async () => {
    const data = {
      name: name,
      email: email,
      mobile_no: mobileno,
      message: message,
    };
    const res = await putApihandler(
      `/updateGovernmentBusinessService/${servicesid}`,
      data
    );
    console.log("update api res is --->", res);
    if (res.message === "Government Business Service updated successfully") {
      swal({
        icon: "success",
        title: "Government Business Service updated successfully",
      });
      setOpen1(false);
      getServices();
    }
  };

  return (
    <AdminLayout>
      <h4>Government Business</h4>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <Button
          sx={{
            backgroundColor: "#121942",
            color: "#fff",
            textTransform: "capitalize",
          }}
          onClick={handleOpen}
        >
          Add Government Business Service
        </Button>
      </div>
      {/* ***** add ca services ******* */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add DSA Services
          </Typography>

          <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Mobile Number</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) => setMobileNo(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Message</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button
            sx={{
              backgroundColor: "#121942",
              color: "#fff",
              textTransform: "capitalize",
            }}
            onClick={AddCaService}
          >
            Add Government Business Service
          </Button>
        </Box>
      </Modal>

      {/* ******** table ********** */}
      <TableContainer component={Paper} className="mt-4">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile Number</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((services, index) => (
              <TableRow
                key={services.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {services.name}
                </TableCell>
                <TableCell>{services.email}</TableCell>
                <TableCell>{services.mobile_no}</TableCell>
                <TableCell>{services.message}</TableCell>
                <TableCell>
                  <EditIcon
                    onClick={() => {
                      setServicesId(services._id);
                      setIndex(index);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ***** add ca services ******* */}
      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add DSA Services
          </Typography>

          <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="text"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Mobile Number</label>
            <input
              type="text"
              className="form-control"
              value={mobileno}
              onChange={(e) => setMobileNo(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Message</label>
            <input
              type="text"
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button
            sx={{
              backgroundColor: "#121942",
              color: "#fff",
              textTransform: "capitalize",
            }}
            onClick={updateServices}
          >
            Update Government Business Service
          </Button>
        </Box>
      </Modal>
    </AdminLayout>
  );
}
