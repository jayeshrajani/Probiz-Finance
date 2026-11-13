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
import logo from "../../images/Probiz-Logo.png"
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

export default function AddProperty() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [states, setStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [propId, setPropId] = useState("");
  const [formData, setFormData] = useState({
    ownerName: "",
    contactNo: "",
    propertyName: "",
    bhk_of_house: "",
    buildUpArea: "",
    propertyType: "",
    price: 0,
    construction_year: "",
    city: "",
    state: "",
    address: "",
    description: "",
    bathrooms: "",
    carpetArea: "",
    houseFacing: "",
    plotArea: "",
    numberOfBalconies: "",
    furnishingStatus: "",
    propertyImage: [], // Now an array
    propertyVideo: null,
  });

  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

  useEffect(() => {
    getProperty();
  }, []);

  useEffect(() => {
    if (propId !== "") {
      getByIdProperty()
    }
  }, [propId]);

  const getByIdProperty = async () =>{
    const res = await getApihandler(`/getPropertyById/${propId}`);
    console.log("re",res);
    if(res.success === true){
        setFormData({
        ownerName: res.data.ownerName || "",
        contactNo: res.data.contactNo || "",
        propertyName: res.data.propertyName || "",
        bhk_of_house: res.data.bhk_of_house || "",
        buildUpArea: res.data.buildUpArea || "",
        propertyType: res.data.propertyType || "",
        price: res.data.price || 0,
        construction_year: res.data.construction_year || "",
        city: res.data.city || "",
        state: res.data.state || "",
        address: res.data.address || "",
        description: res.data.description || "",
        bathrooms: res.data.bathrooms || "",
        carpetArea: res.data.carpetArea || "",
        houseFacing: res.data.houseFacing || "",
        plotArea: res.data.plotArea || "",
        numberOfBalconies: res.data.numberOfBalconies || "",
        furnishingStatus: res.data.furnishingStatus || "",
        propertyImage: [], // Now an array
        propertyVideo: null,
      })
      setOpenModal2(true);
    }
  }
  const getProperty = async () => {
    const res = await getApihandler("/getAllProperty");
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

  const handleInputChangeCity = (e) => {
    const { name, value } = e.target;

    if (name === "state") {
      const selectedState = states.find((s) => s.isoCode === value);
      const cities = City.getCitiesOfState("IN", value);
      setAvailableCities(cities);
      setFormData((prev) => ({
        ...prev,
        state: selectedState.name,
        stateCode: value,
        city: ""
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      propertyImage: Array.from(e.target.files), // Convert FileList to array
    }));
  };

  const handleFileChangeVideo = (e) => {
    setFormData((prev) => ({
      ...prev,
      propertyVideo: e.target.files[0], // Single file
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const body = new FormData();

    for (const key in formData) {
      if (key === "propertyImage" && Array.isArray(formData[key])) {
        formData[key].forEach((file) => {
          body.append("propertyImage", file); // Append each image separately
        });
      } else if (key === "propertyVideo" && formData[key]) {
        body.append("propertyVideo", formData[key]); // Single video
      } else {
        body.append(key, formData[key]);
      }
    }

    console.log("Form Data:");
    for (let pair of body.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    const res = await postApihandler("/addProperty", body);
    console.log("response", res);

    if (res.success === true) {
      getProperty(); // Refresh table\
      setLoading(false);
      setOpenModal(false);
      setFormData({
        ownerName: "",
        contactNo: "",
        propertyName: "",
        bhk_of_house: "",
        buildUpArea: "",
        propertyType: "",
        price: 0,
        construction_year: "",
        city: "",
        state: "",
        address: "",
        description: "",
        bathrooms: "",
        carpetArea: "",
        houseFacing: "",
        plotArea: "",
        numberOfBalconies: "",
        furnishingStatus: "",
        propertyImage: [], // Now an array
        propertyVideo: null,
      })
      alert("Property Added successfully");
    } else {
      setLoading(false);
      alert(`${res.error?.response?.data?.message || 'Something went wrong'}`);
    }
  };

  const handleSubmitUpdate = async () => {
    setLoading(true);
    const body = new FormData();

    for (const key in formData) {
      if (key === "propertyImage" && Array.isArray(formData[key])) {
        formData[key].forEach((file) => {
          body.append("propertyImage", file); // Append each image separately
        });
      } else if (key === "propertyVideo" && formData[key]) {
        body.append("propertyVideo", formData[key]); // Single video
      } else {
        body.append(key, formData[key]);
      }
    }
    console.log("Form Data:");
    for (let pair of body.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
    const res = await putApihandler(`/updateProperty/${propId}`, body);
    console.log("response", res);

    if (res.success === true) {
      getProperty(); // Refresh table
      setLoading(false);
      setOpenModal2(false);
      setFormData({
        ownerName: "",
        contactNo: "",
        propertyName: "",
        bhk_of_house: "",
        buildUpArea: "",
        propertyType: "",
        price: 0,
        construction_year: "",
        city: "",
        state: "",
        address: "",
        description: "",
        bathrooms: "",
        carpetArea: "",
        houseFacing: "",
        plotArea: "",
        numberOfBalconies: "",
        furnishingStatus: "",
        propertyImage: [], // Now an array
        propertyVideo: null,
      });
    
       alert("Property Update successfully");
    } else {
      setLoading(false);
      alert(`${res.error?.response?.data?.message || 'Something went wrong'}`);
    }
  };
 
  const deleteProperty = async (id) => {
    const res = await deleteApihandler(`/deleteProperty/${id}`);
    console.log("res delete", res);
    if (res.success === true) {
      alert("Property deleted successfully")
      getProperty(); // Refresh table
    }
  }

  return (
    <>
     
        <h1>Property</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2, display: "flex", justifyContent: "start", background: "#121942" }}
          onClick={() => setOpenModal(true)}
        >
          Add Property
        </Button>

        <TableContainer component={Paper} sx={{ maxWidth: 1200 }}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: "10%" }}>Sr no.</StyledTableCell>
                <StyledTableCell sx={{ width: "20%" }}>
                  Image
                </StyledTableCell>
                <StyledTableCell sx={{ width: "20%" }}>
                  Property Name
                </StyledTableCell>
                <StyledTableCell>Price</StyledTableCell>
                <StyledTableCell>City</StyledTableCell>
                <StyledTableCell>Address</StyledTableCell>
                <StyledTableCell>BHK</StyledTableCell>
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
                    <StyledTableCell component="th" scope="row">
                      {page * rowsPerPage + index + 1}
                    </StyledTableCell>
                    <StyledTableCell>
  <img
    style={{ width: "40%" }}
    src={
      row.propertyImage && row.propertyImage.length > 0
        ? row.propertyImage[0]
        : logo // Use your fallback image path here
    }
    alt="Property"
    
  />
</StyledTableCell>
                    <StyledTableCell>{row.propertyName}</StyledTableCell>
                    <StyledTableCell>{row.price}</StyledTableCell>
                    <StyledTableCell>{row.city}</StyledTableCell>
                    <StyledTableCell>{row.address}</StyledTableCell>
                    <StyledTableCell>{row.bhk_of_house}</StyledTableCell>
                    <StyledTableCell><DeleteForeverIcon onClick={() => deleteProperty(row._id)} /></StyledTableCell>
                    <StyledTableCell><EditIcon onClick={() => setPropId(row._id)} /></StyledTableCell>
                    <StyledTableCell><Link to={`/propertyDetail/${row._id}`}><PreviewIcon sx={{ color: "black" }} /></Link></StyledTableCell>

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

          <DialogTitle>Add New Property</DialogTitle>

          <DialogContent dividers>
            <TextField fullWidth margin="dense" name="ownerName" label="Owner Name" onChange={handleInputChange} />
            <TextField fullWidth margin="dense" name="contactNo" label="Contact Name" onChange={handleInputChange} />
            <TextField fullWidth margin="dense" name="propertyName" label="Property Name" onChange={handleInputChange} />
            <TextField select fullWidth margin="dense" name="propertyType" label="Property Type" value={formData.propertyType} onChange={handleInputChange} >
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
              <MenuItem value="Pent House">
                Pent House
              </MenuItem>
              <MenuItem value="Commercial Property">
                Commercial Property
              </MenuItem>
              <MenuItem value="Agriculture Land">
                Agriculture Land
              </MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              margin="dense"
              name="bhk_of_house"
              label="BHK"
              value={formData.bhk_of_house}
              onChange={handleInputChange}
            >

              <MenuItem value="1RK">
                1RK
              </MenuItem>
              <MenuItem value="1BHK">
                1BHK
              </MenuItem>
              <MenuItem value="2BHK">
                2BHK
              </MenuItem>
              <MenuItem value="3BHK">
                3BHK
              </MenuItem>
              <MenuItem value="4BHK">
                4BHK
              </MenuItem>
              <MenuItem value="5BHK">
                5BHK
              </MenuItem>
              <MenuItem value="6BHK">
                6BHK
              </MenuItem>

            </TextField>


            {["Flat", "Pent House", "Commercial Property"].includes(formData.propertyType) ? (
              <>
                <TextField
                  fullWidth
                  margin="dense"
                  name="buildUpArea"
                  label="Build Up Area (Sqft)"
                  onChange={handleInputChange}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  name="carpetArea"
                  label="Carpet Area (Sqft)"
                  onChange={handleInputChange}
                />
              </>
            ) : (

              <TextField
                fullWidth
                margin="dense"
                name="plotArea"
                label="Plot Area (Sqft)"
                onChange={handleInputChange}
              />
            )}
            <TextField
              select
              fullWidth
              margin="dense"
              name="houseFacing"
              label="House Facing"
              value={formData.houseFacing}
              onChange={handleInputChange}
            >
              {["North", "South", "East", "West"].map((val) => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              margin="dense"
              name="bathrooms"
              label="Bathrooms"
              value={formData.bathrooms}
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: "bathrooms",
                    value: parseInt(e.target.value, 10), // ensure numeric value
                  },
                })
              }
            >
              {[1, 2, 3, 4, 5, 6].map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth margin="dense" name="construction_year" label="Construction Year" onChange={handleInputChange} />
            <TextField
              select
              fullWidth
              margin="dense"
              name="numberOfBalconies"
              label="No. of Balconies"
              value={formData.numberOfBalconies}
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5, 6].map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              margin="dense"
              name="furnishingStatus"
              label="Furnishing Status"
              value={formData.furnishingStatus}
              onChange={handleInputChange}
            >
              {["Furnished", "Semi-Furnished", "Unfurnished"].map((val) => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>


            <TextField
              select
              fullWidth
              margin="dense"
              name="state"
              label="State"
              value={formData.stateCode}
              onChange={handleInputChangeCity}
            >
              {states.map((s) => (
                <MenuItem key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              margin="dense"
              name="city"
              label="City"
              value={formData.city}
              onChange={handleInputChangeCity}
              disabled={!formData.state}
            >
              {availableCities.map((c) => (
                <MenuItem key={c.name} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField fullWidth margin="dense" name="address" label="Address" onChange={handleInputChange} />
            <TextField fullWidth margin="dense" name="price" label="Price" onChange={handleInputChange} />

            <TextField id="outlined-multiline-flexible" fullWidth multiline rows={4} margin="dense" name="description" label="Description" onChange={handleInputChange} />
            <div>
              <p>Property Image</p>
              <input
                type="file"
                name="propertyImage"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ marginTop: 10 }}
              />
            </div>
            <div>
              <p>Property Video</p>
              <input
                type="file"
                name="propertyVideo"
                accept="video/*"
                onChange={handleFileChangeVideo}
                style={{ marginTop: 10 }}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} sx={{ color: "#121942" }}>Cancel</Button>
            {/* <Button variant="contained" onClick={handleSubmit} sx={{ background: "#121942" }}>Submit</Button> */}
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
            <TextField fullWidth margin="dense" name="ownerName" label="Owner Name" value={formData.ownerName || ""} onChange={handleInputChange} />
            <TextField fullWidth margin="dense" name="contactNo" label="Contact Name" value={formData.contactNo || ""} onChange={handleInputChange} />
            <TextField fullWidth margin="dense" name="propertyName" label="Property Name" value={formData.propertyName || ""} onChange={handleInputChange} />
            <TextField select fullWidth margin="dense" name="propertyType" label="Property Type" value={formData.propertyType} onChange={handleInputChange} >
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
              <MenuItem value="Pant House">
                Commercial Property
              </MenuItem>
              <MenuItem value="Pant House">
                Agriculture Land
              </MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              margin="dense"
              name="bhk_of_house"
              label="BHK"
              value={formData.bhk_of_house}
              onChange={handleInputChange}
            >

              <MenuItem value="1RK">
                1RK
              </MenuItem>
              <MenuItem value="1BHK">
                1BHK
              </MenuItem>
              <MenuItem value="2BHK">
                2BHK
              </MenuItem>
              <MenuItem value="3BHK">
                3BHK
              </MenuItem>
              <MenuItem value="4BHK">
                4BHK
              </MenuItem>
              <MenuItem value="5BHK">
                5BHK
              </MenuItem>
              <MenuItem value="6BHK">
                6BHK
              </MenuItem>

            </TextField>


            {["Flat", "Pent House", "Commercial Property"].includes(formData.propertyType) ? (
              <>
                <TextField
                  fullWidth
                  margin="dense"
                  name="buildUpArea"
                  label="Build Up Area (Sqft)"
                  value={formData.buildUpArea}
                  onChange={handleInputChange}

                />
                <TextField
                  fullWidth
                  margin="dense"
                  name="carpetArea"
                  label="Carpet Area (Sqft)"
                  value={formData.carpetArea}
                  onChange={handleInputChange}
                />
              </>
            ) : (

              <TextField
                fullWidth
                margin="dense"
                name="plotArea"
                label="Plot Area (Sqft)"
                value={formData.plotArea}
                onChange={handleInputChange}
              />
            )}
            <TextField
              select
              fullWidth
              margin="dense"
              name="houseFacing"
              label="House Facing"
              value={formData.houseFacing}
              onChange={handleInputChange}
            >
              {["North", "South", "East", "West"].map((val) => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              margin="dense"
              name="bathrooms"
              label="Bathrooms"
              value={formData.bathrooms}
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: "bathrooms",
                    value: parseInt(e.target.value, 10), // ensure numeric value
                  },
                })
              }
            >
              {[1, 2, 3, 4, 5, 6].map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth margin="dense" name="construction_year" label="Construction Year"  value={formData.construction_year}  onChange={handleInputChange} />
            <TextField
              select
              fullWidth
              margin="dense"
              name="numberOfBalconies"
              label="No. of Balconies"
              value={formData.numberOfBalconies}
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5, 6].map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              margin="dense"
              name="furnishingStatus"
              label="Furnishing Status"
              value={formData.furnishingStatus}
              onChange={handleInputChange}
            >
              {["Furnished", "Semi-Furnished", "Unfurnished"].map((val) => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>


            <TextField
              select
              fullWidth
              margin="dense"
              name="state"
              label="State"
              value={formData.stateCode}
              onChange={handleInputChangeCity}
            >
              {states.map((s) => (
                <MenuItem key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              margin="dense"
              name="city"
              label="City"
              value={formData.city}
              onChange={handleInputChangeCity}
              disabled={!formData.state}
            >
              {availableCities.map((c) => (
                <MenuItem key={c.name} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField fullWidth margin="dense" name="address" label="Address"  value={formData.address} onChange={handleInputChange} />
            <TextField fullWidth margin="dense" name="price" label="Price" value={formData.price} onChange={handleInputChange} />

            <TextField id="outlined-multiline-flexible" fullWidth multiline rows={4} margin="dense" name="description" label="Description" value={formData.description} onChange={handleInputChange} />
            <div>
              <p>Property Image</p>
              <input
                type="file"
                name="propertyImage"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ marginTop: 10 }}
              />
            </div>
            <div>
              <p>Property Video</p>
              <input
                type="file"
                name="propertyVideo"
                accept="video/*"
                onChange={handleFileChangeVideo}
                style={{ marginTop: 10 }}
              />
            </div>
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
