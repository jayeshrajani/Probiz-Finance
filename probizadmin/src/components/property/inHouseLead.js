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
import { deleteApihandler, getApihandler, postApihandler, putApihandler } from "../../Apihandler";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button,
  MenuItem,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PreviewIcon from '@mui/icons-material/Preview';
import { Link } from "react-router-dom";
import { State, City } from 'country-state-city';

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

export default function InHouseLead() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [index, setIndex] = useState("");
  const [propId, setPropId] = useState();
  const [formData, setFormData] = useState({
  name: "",
  contactNumber: "",
  alternateContactNumber: "",
  budget: "",
  location: "",
  size: "",
  bhk: "",
  propertyType: "", // comm, resi, semi, plot, agriculture land
  width: "",
  length: "",
  houseFacing: "",
  loanAmountRequired: "",
  cashInHand: ""
});

  useEffect(() => {
    getProperty();
  }, []);

  useEffect(() => {
  if (index !== "") {
    const {
      name,
      contactNumber,
      alternateContactNumber,
      budget,
      location,
      size,
      bhk,
      propertyType,
      width,
      length,
      houseFacing,
      loanAmountRequired,
      cashInHand,
      _id
    } = data[index];

    setFormData({
      name: name || "",
      contactNumber: contactNumber || "",
      alternateContactNumber: alternateContactNumber || "",
      budget: budget || "",
      location: location || "",
      size: size || "",
      bhk: bhk || "",
      propertyType: propertyType || "",
      width: width || "",
      length: length || "",
      houseFacing: houseFacing || "",
      loanAmountRequired: loanAmountRequired || "",
      cashInHand: cashInHand || "",
    });

    setOpenModal2(true);
    setPropId(_id);
  }
  }, [index]);


  const getProperty = async () => {
    const res = await getApihandler("/getAllInHouseProperty");
    console.log("res", res);
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
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async () => {
  setLoading(true);

  
    const body = {
      name: formData.name,
      contactNumber: formData.contactNumber,
      alternateContactNumber: formData.alternateContactNumber,
      budget: formData.budget,
      location: formData.location,
      size: formData.size,
      bhk: formData.bhk,
      propertyType: formData.propertyType,
      width: formData.width,
      length: formData.length,
      houseFacing: formData.houseFacing,
      loanAmountRequired: formData.loanAmountRequired,
      cashInHand: formData.cashInHand
    };
console.log("body",body);

    const res = await postApihandler("/addInHouseProperty", body);
     console.log("res",res);
     
    if (res.success === true) {
      getProperty(); 
      setLoading(false);
      setOpenModal(false);
      setFormData({
        name: "",
        contactNumber: "",
        alternateContactNumber: "",
        budget: "",
        location: "",
        size: "",
        bhk: "",
        propertyType: "",
        width: "",
        length: "",
        houseFacing: "",
        loanAmountRequired: "",
        cashInHand: ""
      });
      alert("Property Added successfully");
    } else {
      throw new Error(res?.error?.response?.data?.message);
    }
 
 };

  const handleSubmitUpdate = async () => {
  setLoading(true);

  const body = {
    name: formData.name,
    contactNumber: formData.contactNumber,
    alternateContactNumber: formData.alternateContactNumber,
    budget: formData.budget,
    location: formData.location,
    size: formData.size,
    bhk: formData.bhk,
    propertyType: formData.propertyType,
    width: formData.width,
    length: formData.length,
    houseFacing: formData.houseFacing,
    loanAmountRequired: formData.loanAmountRequired,
    cashInHand: formData.cashInHand
  };

 
    const res = await putApihandler(`/updateInHouseProperty/${propId}`, body);
    console.log("response", res);

    if (res.success === true) {
      getProperty(); // Refresh table
      setLoading(false);
      setOpenModal2(false);
      setFormData({
        name: "",
        contactNumber: "",
        alternateContactNumber: "",
        budget: "",
        location: "",
        size: "",
        bhk: "",
        propertyType: "",
        width: "",
        length: "",
        houseFacing: "",
        loanAmountRequired: "",
        cashInHand: ""
      });
      setIndex("");
      alert("Property updated successfully");
    } else {
      throw new Error(res?.error?.response?.data?.message);
    }
  
};

  const deleteProperty = async (id) => {
    const res = await deleteApihandler(`/deleteInHouseProperty/${id}`);
    console.log("res delete", res);
    if (res.success === true) {
      alert("Property deleted successfully")
      getProperty(); // Refresh table
    }
  }

  return (
    <>
     
        <h1>In House Lead</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2, display: "flex", justifyContent: "start", background: "#121942" }}
          onClick={() => setOpenModal(true)}
        >
          Add In House
        </Button>
        
       <TableContainer component={Paper} sx={{ maxWidth: 1200 }}>
  <Table aria-label="customized table">
    <TableHead>
      <TableRow>
        <StyledTableCell>Sr no.</StyledTableCell>
        <StyledTableCell>Name</StyledTableCell>
        <StyledTableCell>Contact</StyledTableCell>
        <StyledTableCell>Alternate Contact</StyledTableCell>
        <StyledTableCell>Budget</StyledTableCell>
        <StyledTableCell>Location</StyledTableCell>
        <StyledTableCell>BHK</StyledTableCell>
        <StyledTableCell>Property Type</StyledTableCell>
        <StyledTableCell>Delete</StyledTableCell>
        <StyledTableCell>Edit</StyledTableCell>
        <StyledTableCell>View</StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row, index) => (
          <StyledTableRow key={row._id}>
            <StyledTableCell>{page * rowsPerPage + index + 1}</StyledTableCell>
            <StyledTableCell>{row.name}</StyledTableCell>
            <StyledTableCell>{row.contactNumber}</StyledTableCell>
            <StyledTableCell>{row.alternateContactNumber || '-'}</StyledTableCell>
            <StyledTableCell>{row.budget}</StyledTableCell>
            <StyledTableCell>{row.location}</StyledTableCell>
            <StyledTableCell>{row.bhk}</StyledTableCell>
            <StyledTableCell>{row.propertyType}</StyledTableCell>
            <StyledTableCell>
              <DeleteForeverIcon onClick={() => deleteProperty(row._id)} sx={{ cursor: "pointer" }} />
            </StyledTableCell>
            <StyledTableCell>
              <EditIcon onClick={() => setIndex(index)} sx={{ cursor: "pointer" }} />
            </StyledTableCell>
            <StyledTableCell>
              <Link to={`/propertyDetail/${row._id}`}>
                <PreviewIcon sx={{ color: "black" }} />
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
        {/* add property model */}
     
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Add In House</DialogTitle>
  <DialogContent dividers>
    <TextField fullWidth margin="dense" name="name" label="Name" onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="contactNumber" label="Contact Number" onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="alternateContactNumber" label="Alternate Contact Number" onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="budget" label="Budget" onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="location" label="Location" onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="size" label="Size (Sqft)" onChange={handleInputChange} />

    <TextField
      select
      fullWidth
      margin="dense"
      name="bhk"
      label="BHK"
      value={formData.bhk}
      onChange={handleInputChange}
    >
      {["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "6BHK"].map(val => (
        <MenuItem key={val} value={val}>{val}</MenuItem>
      ))}
    </TextField>

    <TextField
      select
      fullWidth
      margin="dense"
      name="propertyType"
      label="Property Type"
      value={formData.propertyType}
      onChange={handleInputChange}
    >
      <MenuItem value="Flat">
                Flat
              </MenuItem>
              <MenuItem value="Row House">
                Row House
              </MenuItem>
              <MenuItem value="Bunglow">
                Bungalow
              </MenuItem>
              <MenuItem value="Plot">
                Plot
              </MenuItem>
              <MenuItem value="Farm House">
                Farm House
              </MenuItem>
              <MenuItem value="Pant House">
                Pent House
              </MenuItem>
              <MenuItem value="Commercial Property">
                Commercial Property
              </MenuItem>
              <MenuItem value="Agriculture Land">
                Agriculture Land
              </MenuItem>
    </TextField>

    <TextField fullWidth margin="dense" name="width" label="Width (ft)" onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="length" label="Length (ft)" onChange={handleInputChange} />

    <TextField
      select
      fullWidth
      margin="dense"
      name="houseFacing"
      label="House Facing"
      value={formData.houseFacing}
      onChange={handleInputChange}
    >
      {["North", "South", "East", "West"].map(val => (
        <MenuItem key={val} value={val}>{val}</MenuItem>
      ))}
    </TextField>

    <TextField fullWidth margin="dense" name="loanAmountRequired" label="Loan Amount Required" onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="cashInHand" label="Cash In Hand" onChange={handleInputChange} />
  </DialogContent>
  
  <DialogActions>
    <Button onClick={() => setOpenModal(false)} sx={{ color: "#121942" }}>Cancel</Button>
    <Button
      variant="contained"
      onClick={handleSubmit}
      sx={{ background: "#121942" }}
      disabled={loading}
    >
      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit'}
    </Button>
  </DialogActions>
</Dialog>
        {/* Update property model */}
        <Dialog open={openModal2} onClose={() => setOpenModal2(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Property</DialogTitle>
          <DialogContent dividers>
    <TextField fullWidth margin="dense" name="name" label="Name" value={formData.name} onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="contactNumber" label="Contact Number" value={formData.contactNumber} onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="alternateContactNumber" value={formData.alternateContactNumber} label="Alternate Contact Number" onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="budget" label="Budget" value={formData.budget} onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="location" label="Location" value={formData.location} onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="size" label="Size (Sqft)" value={formData.size} onChange={handleInputChange} />

    <TextField
      select
      fullWidth
      margin="dense"
      name="bhk"
      label="BHK"
      value={formData.bhk}
      onChange={handleInputChange}
    >
      {["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "6BHK"].map(val => (
        <MenuItem key={val} value={val}>{val}</MenuItem>
      ))}
    </TextField>

    <TextField
      select
      fullWidth
      margin="dense"
      name="propertyType"
      label="Property Type"
      value={formData.propertyType}
      onChange={handleInputChange}
    >
      <MenuItem value="Flat">
                Flat
              </MenuItem>
              <MenuItem value="Row House">
                Row House
              </MenuItem>
              <MenuItem value="Bunglow">
                Bungalow
              </MenuItem>
              <MenuItem value="Plot">
                Plot
              </MenuItem>
              <MenuItem value="Farm House">
                Farm House
              </MenuItem>
              <MenuItem value="Pant House">
                Pent House
              </MenuItem>
              <MenuItem value="Commercial Property">
                Commercial Property
              </MenuItem>
              <MenuItem value="Agriculture Land">
                Agriculture Land
              </MenuItem>
    </TextField>

    <TextField fullWidth margin="dense" name="width" label="Width (ft)"  value={formData.width} onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="length" label="Length (ft)"  value={formData.length} onChange={handleInputChange} />

    <TextField
      select
      fullWidth
      margin="dense"
      name="houseFacing"
      label="House Facing"
      value={formData.houseFacing}
      onChange={handleInputChange}
    >
      {["North", "South", "East", "West"].map(val => (
        <MenuItem key={val} value={val}>{val}</MenuItem>
      ))}
    </TextField>

    <TextField fullWidth margin="dense" name="loanAmountRequired" label="Loan Amount Required"  value={formData.loanAmountRequired} onChange={handleInputChange} />
    <TextField fullWidth margin="dense" name="cashInHand" label="Cash In Hand"  value={formData.cashInHand} onChange={handleInputChange} />
  </DialogContent>
  
  <DialogActions>
    <Button onClick={() => setOpenModal2(false)} sx={{ color: "#121942" }}>Cancel</Button>
    <Button
      variant="contained"
      onClick={handleSubmitUpdate}
      sx={{ background: "#121942" }}
      disabled={loading}
    >
      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit'}
    </Button>
  </DialogActions>
        </Dialog>

    </>
  );
}

