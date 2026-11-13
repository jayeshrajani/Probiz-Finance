import React, { useEffect, useRef, useState } from "react";
import { State, City } from "country-state-city";
import { PostRequestFormControl, userDataProvider } from "../components/api-handler";
import HeaderSec from "../components/common-component/HeaderSec";
import Footer from "../components/common-component/Footer";
import swal from "sweetalert";
import { useRouter } from "next/router";
export default function AddPropertyPage() {
  const router = useRouter();
  const hasChecked = useRef(false); // guard to prevent double run
  const [formData, setFormData] = useState({
    ownerName: "", contactNo: "", propertyName: "", bhk_of_house: "", buildUpArea: "",
    propertyType: "", price: 0, construction_year: "", city: "", state: "", address: "",
    description: "", bathrooms: "", carpetArea: "", houseFacing: "", plotArea: "",
    numberOfBalconies: "", furnishingStatus: "", propertyImage: [], propertyVideo: null,
  });

  const [loading, setLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
     if (hasChecked.current) return; // block if already ran
    hasChecked.current = true;

    const userData = userDataProvider();
    console.log("userData", userData);

    if (!userData) {
      swal({
               icon: "warning",
               text: "Please login first",
             }).then(() => {
               // Refresh the page after OK click
               router.push("/home");
             });
   
      
    }
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        city: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, propertyImage: Array.from(e.target.files) }));
  };

  const handleFileChangeVideo = (e) => {
    setFormData((prev) => ({ ...prev, propertyVideo: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const body = new FormData();
    for (const key in formData) {
      if (key === "propertyImage") {
        formData[key].forEach((file) => body.append("propertyImage", file));
      } else if (key === "propertyVideo") {
        if (formData[key]) body.append("propertyVideo", formData[key]);
      } else {
        body.append(key, formData[key]);
      }
    }

    try {
      const res = await PostRequestFormControl("addProperty", body);
      if (res.success) {
        swal({
               icon: "success",
               text: "Property added successfully",
             }).then(() => {
               // Refresh the page after OK click
               router.reload();
             });
        
        setFormData({ ...formData, propertyImage: [], propertyVideo: null });
      } else {
        swal({
               icon: "error",
               title: "Please Try Again",
               text: res?.error?.response?.data?.message || "Something went wrong"
             });
       
      }
    } catch (err) {
       swal({
               icon: "error",
               title: "Please Try Again",
               text:  "Error submitting form"
             });
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderSec />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-center mb-6 mt-10">Add New Property</h1>
        <form className="space-y-4">
          <Input label="Owner Name" name="ownerName" onChange={handleInputChange} />
          <Input label="Contact Number" name="contactNo" type="tel"  maxLength={10} onChange={handleInputChange} />
          <Input label="Property Name" name="propertyName" onChange={handleInputChange} />

          <Select
            label="Property Type"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleInputChange}
            options={["Flat", "Row House", "Bunglow", "Plot", "Farm House", "Pant House", "Commercial Property", "Agriculture Land"]}
          />

          <Select
            label="BHK"
            name="bhk_of_house"
            value={formData.bhk_of_house}
            onChange={handleInputChange}
            options={["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "6BHK"]}
          />

          {["Flat", "Pent House", "Commercial Property"].includes(formData.propertyType) ? (
            <>
              <Input label="Build Up Area (Sqft)" name="buildUpArea" onChange={handleInputChange} />
              <Input label="Carpet Area (Sqft)" name="carpetArea" onChange={handleInputChange} />
            </>
          ) : (
            <Input label="Plot Area (Sqft)" name="plotArea" onChange={handleInputChange} />
          )}

          <Select
            label="House Facing"
            name="houseFacing"
            value={formData.houseFacing}
            onChange={handleInputChange}
            options={["North", "South", "East", "West"]}
          />

          <Select
            label="Bathrooms"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            options={["1", "2", "3", "4", "5", "6"]}
          />

          <Input label="Construction Year" name="construction_year" onChange={handleInputChange} />

          <Select
            label="No. of Balconies"
            name="numberOfBalconies"
            value={formData.numberOfBalconies}
            onChange={handleInputChange}
            options={["1", "2", "3", "4", "5", "6"]}
          />

          <Select
            label="Furnishing Status"
            name="furnishingStatus"
            value={formData.furnishingStatus}
            onChange={handleInputChange}
            options={["Furnished", "Semi-Furnished", "Unfurnished"]}
          />

          <Select
            label="State"
            name="state"
            value={formData.state}
            onChange={handleInputChangeCity}
            options={states.map((s) => ({ value: s.isoCode, label: s.name }))}
          />

          <Select
            label="City"
            name="city"
            value={formData.city}
            onChange={handleInputChangeCity}
            disabled={!formData.state}
            options={availableCities.map((c) => c.name)}
          />

          <Input label="Address" name="address" onChange={handleInputChange} />
          <Input label="Price" name="price" onChange={handleInputChange} />

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Property Images</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mt-2">Property Video</label>
            <input type="file" accept="video/*" onChange={handleFileChangeVideo} />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-indigo-800 text-white px-4 py-2 rounded hover:bg-indigo-900"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

function Input({ label, name, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md p-2"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-md p-2"
      >
        <option value="">Select {label}</option>
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
      </select>
    </div>
  );
}
