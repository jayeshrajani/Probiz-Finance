import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApihandler } from "../Apihandler";
import logo from "../images/Probiz-Logo.png"
export default function PropertyDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    getProperty();
  }, []);

  const getProperty = async () => {
    const res = await getApihandler(`/getPropertyById/${id}`);
    console.log("res 66",res);
    
    if (res.success === true) {
      setData(res.data);
    }
  };

  if (!data) return <div className="loading">Loading...</div>;

  return (
    <div className="property-container">
       <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="property-card">
        {
          data.propertyImage && data.propertyImage.length > 0?
          <img src={data.propertyImage} alt={data.propertyName} className="property-image" />
          :
          <img src={logo} alt={data.propertyName} style={{width:"60%"}} />

        }




        {/* <img src={
        data.propertyImage && data.propertyImage.length > 0
      ? data.propertyImage
      : logo 
      } alt={data.propertyName} className="property-image" /> */}

        <div className="property-content">
  <h1 className="property-title">{data.propertyName}</h1>
  <p className="property-type">{data.propertyType} - {data.bhk_of_house}</p>
  <p className="property-price">₹ {data.price.toLocaleString()}</p>
 <div> 
  <h3>Property Owner</h3>
  <p><strong>Name:</strong> {data.ownerName}</p>
      <p><strong>Mobile No:</strong> {data.contactNo}</p>
 </div>
  <div className="property-details">
   
    <div>
      <h3>Property Overview</h3>
      <p><strong>Bathrooms:</strong> {data.bathrooms}</p>
      <p><strong>Bedrooms:</strong> {data.numberOfBedrooms}</p>
      <p><strong>Balconies:</strong> {data.numberOfBalconies}</p>
      <p><strong>Build-up Area:</strong> {data.buildUpArea} sq ft</p>
      <p><strong>Plot Area:</strong> {data.plotArea} sq ft</p>
      <p><strong>Carpet Area:</strong> {data.carpetArea} sq ft</p>
      <p><strong>Build-up Type:</strong> {data.buildUp_type}</p>
      <p><strong>Furnishing:</strong> {data.furnishingStatus}</p>
      <p><strong>House Facing:</strong> {data.houseFacing}</p>
      <p><strong>Construction Year:</strong> {data.construction_year}</p>
      <p><strong>Construction Status:</strong> {data.construction_status}</p>
      <p><strong>Property Title:</strong> {data.propertyTitle}</p>
    </div>

    <div>
      <h3>Location</h3>
      <p><strong>Address:</strong> {data.address}</p>
      <p><strong>City:</strong> {data.city}</p>
      <p><strong>State:</strong> {data.state}</p>
    </div>
  </div>

  <div className="property-description">
    <h3>Description</h3>
    <p>{data.description}</p>
  </div>
</div>
      </div>
    </div>
  );
}
