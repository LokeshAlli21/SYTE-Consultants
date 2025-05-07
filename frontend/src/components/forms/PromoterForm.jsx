import React, { useEffect, useRef, useState } from 'react';
import FileInputWithPreview from './FileInputWithPreview ';
import databaseService from '../../backend-services/database/database';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import Select from 'react-select';

const PromoterForm = ({id , disabled }) => { 

    const selectRef = useRef(null);

    const [cityOptions, setCityOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
  
    // Fetch cities and districts on component mount
    useEffect(() => {
      async function fetchCitiesAndDistricts() {
        try {
          const { cityOptions, districtOptions } = await databaseService.getAllCitiesAndDistricts(); // Make sure this returns data
          setCityOptions(cityOptions);
          setDistrictOptions(districtOptions);
        } catch (error) {
          console.error("Error fetching cities and districts:", error);
        }
      }
  
      fetchCitiesAndDistricts();
    }, []);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    promoter_name: '',
    contact_number: '',
    email_id: '',
    district: '',
    city: '',
    office_address: '',
    promoter_type: '',
    full_name: '',
    aadhar_number: null,
    aadhar_uploaded_url: '',
    pan_number: '',
    pan_uploaded_url: '',
    dob: '',
    contact_person_name: '',
    partnership_pan_number: '',
    partnership_pan_uploaded_url: '',
    company_pan_number: '',
    company_pan_uploaded_url: '',
    company_incorporation_number: '',
    company_incorporation_uploaded_url: '',
    promoter_photo_uploaded_url: '',
  });

  
const [filePreviews, setFilePreviews] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate promoter type
    if (!formData.promoter_type) {
      alert('Please select promoter type');
      return;
    }
  
    console.log('Form Data:', formData);
    setLoading(true);
  
    try {
      // Check if formData contains an id for update or not
      if (id) {
        // If ID exists, update the promoter
        const response = await databaseService.updatePromoter(id, formData);
        console.log("✅ Promoter updated:", response);
        toast.success("✅ Promoter updated successfully!");
        navigate("/promoters"); // Navigate on success
      } else {
        // If no ID, create a new promoter
        const response = await databaseService.uploadPromoterData(formData);
        console.log("✅ Promoter created:", response);
        toast.success("✅ Promoter created successfully!");
        navigate("/promoters"); // Navigate on success
      }
    } catch (error) {
      console.error("❌ Error handling Promoter:", error);
      toast.error(`❌ Failed to handle Promoter: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // If the currently focused element is react-select and menu is not open
      if (document.activeElement === selectRef.current?.inputRef && !selectRef.current?.state?.menuIsOpen) {
        e.preventDefault(); // prevent accidental form submit
        return;
      }
  
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1]?.focus();
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [name]: file }));
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({
          ...prev,
          [name]: { url: reader.result, type: file.type }
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
 const handleFileDelete = (name) => {
  setFormData(prev => ({ ...prev, [name]: null }));

  setFilePreviews(prev => {
    const updatedPreviews = { ...prev };
    delete updatedPreviews[name];
    return updatedPreviews;
  });
};

useEffect(() => {
  const fetchPromoterData = async () => {
    if (!id) return;

    try {
      const response = await databaseService.getPromoterDetailsById(id);
      console.log("✅ Promoter Response:", response);
      
      if (response && response.promoter_details && response.promoter_details.length > 0) {
        const details = response.promoter_details[0]; // assuming only one detail object

        setFormData({
          promoter_name: response.promoter_name || '',
          contact_number: response.contact_number || '',
          email_id: response.email_id || '',
          district: response.district || '',
          city: response.city || '',
          promoter_type: response.promoter_type || '',
          office_address: details.office_address || '',
          full_name: details.full_name || '',
          aadhar_number: details.aadhar_number || null,
          aadhar_uploaded_url: details.aadhar_uploaded_url || '',
          pan_number: details.pan_number || '',
          pan_uploaded_url: details.pan_uploaded_url || '',
          dob: details.dob || '',
          contact_person_name: details.contact_person_name || '',
          partnership_pan_number: details.partnership_pan_number || '',
          partnership_pan_uploaded_url: details.partnership_pan_uploaded_url || '',
          company_pan_number: details.company_pan_number || '',
          company_pan_uploaded_url: details.company_pan_uploaded_url || '',
          company_incorporation_number: details.company_incorporation_number || '',
          company_incorporation_uploaded_url: details.company_incorporation_uploaded_url || '',
          promoter_photo_uploaded_url: details.promoter_photo_uploaded_url || '',
        });
      } else {
        toast.error("❌ Promoter details not found.");
      }


      const uploadedUrls = {};

      if (Array.isArray(response?.promoter_details)) {
        response.promoter_details.forEach((detail) => {
          Object.entries(detail || {}).forEach(([key, value]) => {
            if (
              typeof key === "string" &&
              key.endsWith("_uploaded_url") &&
              typeof value === "string" &&
              value.startsWith("http")
            ) {
              uploadedUrls[key] = value;
            }
          });
        });
      }

      console.log("✅ Uploaded URLs:", uploadedUrls);

      if (Object.keys(uploadedUrls).length > 0) {
        setFilePreviews(uploadedUrls);
      }

      toast.success("✅ Promoter details loaded successfully!");
    } catch (error) {
      console.error("❌ Error fetching promoter data:", error);
      toast.error(`❌ Failed to load promoter data: ${error.message}`);
    }
  };

  fetchPromoterData();
}, [id]);


  


  const commonInputClass = "border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] focus:border-[#5CAAAB] focus:outline-none transition ease-in-out duration-150 " ;
  const renderConditionalFields = () => {

  
    switch (formData.promoter_type) {
      case 'individual':
        return (
          <>
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Aadhar Number</label>
              <input
                type='number'
                name="aadhar_number"
                value={formData.aadhar_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload Aadhar Document"
              name="aadhar_uploaded_url"
              onChange={handleFileChange}
disabled={disabled}
              filePreview={filePreviews.aadhar_uploaded_url}
              onDelete={() => handleFileDelete("aadhar_uploaded_url")}
            />
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload PAN Document"
              name="pan_uploaded_url"
              onChange={handleFileChange}
disabled={disabled}
              filePreview={filePreviews.pan_uploaded_url}
              onDelete={() => handleFileDelete("pan_uploaded_url")}
            />
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Email ID</label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
          </>
        );
  
      case 'partnership_firm':
        return (
          <>
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Contact Person Name</label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Partnership PAN Number</label>
              <input
                type="text"
                name="partnership_pan_number"
                value={formData.partnership_pan_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload Partnership PAN Document"
              name="partnership_pan_uploaded_url"
              onChange={handleFileChange}
disabled={disabled}
              filePreview={filePreviews.partnership_pan_uploaded_url}
              onDelete={() => handleFileDelete("partnership_pan_uploaded_url")}
            />
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Email ID</label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
          </>
        );
  
      case 'pvt_ltd':
        return (
          <>
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Contact Person Name</label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Company PAN Number</label>
              <input
                type="text"
                name="company_pan_number"
                value={formData.company_pan_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload Company PAN Document"
              name="company_pan_uploaded_url"
              onChange={handleFileChange}
disabled={disabled}
              filePreview={filePreviews.company_pan_uploaded_url}
              onDelete={() => handleFileDelete("company_pan_uploaded_url")}
            />
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Company Incorporation Number</label>
              <input
                type="text"
                name="company_incorporation_number"
                value={formData.company_incorporation_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload Company Incorporation Document"
              name="company_incorporation_uploaded_url"
              onChange={handleFileChange}
disabled={disabled}
              filePreview={filePreviews.company_incorporation_uploaded_url}
              onDelete={() => handleFileDelete("company_incorporation_uploaded_url")}
            />
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Email ID</label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
          </>
        );
  
      default:
        return null;
    }
  };
  
  
  
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8"
    >
      {loading ? (
          <div className="fixed inset-0 min-h-screen bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="flex items-center space-x-2 text-white">
            <FaSpinner className="animate-spin text-4xl" />
            <span className="text-xl">Submitting...</span>
          </div>
        </div>
        ) : (<>
      <h2 className="text-3xl font-bold text-[#5CAAAB] text-center mb-6">
        Promoter Information
      </h2>
  
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Common Fields */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold text-sm mb-1">
            Promoter Name *
          </label>
          <input
            type="text"
            name="promoter_name"
            value={formData.promoter_name}
            onChange={handleChange}
disabled={disabled}
            placeholder='Enter Name'
            onKeyDown={handleKeyDown}
            required
            className={commonInputClass}
          />
        </div>

<div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Promoter Type *</label>
  <Select
    options={[
      { label: 'Individual', value: 'individual' },
      { label: 'Partnership Firm', value: 'partnership_firm' },
      { label: 'PVT LTD', value: 'pvt_ltd' }
    ]}
    value={{
      label: formData.promoter_type === 'individual' ? 'Individual' :
             formData.promoter_type === 'partnership_firm' ? 'Partnership Firm' :
             formData.promoter_type === 'pvt_ltd' ? 'PVT LTD' : "",
      value: formData.promoter_type
    }}
    required={true}
    isDisabled={disabled}
    onChange={(selectedOption) => {
      setFormData((prev) => ({
        ...prev,
        promoter_type: selectedOption ? selectedOption.value : ''
      }));
    }}
    isSearchable={true}
    placeholder="Select Promoter Type"
    styles={{
      control: (base, state) => ({
        ...base,
        padding: "6px",
        borderRadius: "0.5rem",
        borderColor: state.isFocused ? "#5caaab" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 2px #5caaab66" : "none",
        "&:hover": {
          borderColor: "#5caaab",
        },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        zIndex: 20,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "#5caaab"
          : state.isFocused
          ? "#5caaab22"
          : "white",
        color: state.isSelected ? "white" : "black",
        padding: "10px 12px",
        cursor: "pointer",
      }),
    }}
  />
</div>

  
        <div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select District *</label>
  <Select
    options={districtOptions} // This should be the array of districts
    value={districtOptions.find(opt => opt.value === formData.district)}
    required={true}
    isDisabled={disabled}
    onChange={(selectedOption) => {
      setFormData((prev) => ({
        ...prev,
        district: selectedOption ? selectedOption.value : '',
      }));
    }}
    isSearchable={true}
    ref={selectRef}
    placeholder="Select a district"
    styles={{
      control: (base, state) => ({
        ...base,
        padding: "6px",
        borderRadius: "0.5rem",
        borderColor: state.isFocused ? "#5caaab" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 2px #5caaab66" : "none",
        "&:hover": {
          borderColor: "#5caaab",
        },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        zIndex: 20,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "#5caaab"
          : state.isFocused
          ? "#5caaab22"
          : "white",
        color: state.isSelected ? "white" : "black",
        padding: "10px 12px",
        cursor: "pointer",
      }),
    }}
  />
</div>

        <FileInputWithPreview
              label="Upload Photo"
              name="promoter_photo_uploaded_url"
              onChange={handleFileChange}
disabled={disabled}
              filePreview={filePreviews.promoter_photo_uploaded_url}
              onDelete={() => handleFileDelete("promoter_photo_uploaded_url")}
            />

<div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select City *</label>
  <Select
    options={cityOptions} // This should be the array of cities
    value={cityOptions.find(opt => opt.value === formData.city)}
    required={true}
    onChange={(selectedOption) => {
      setFormData((prev) => ({
        ...prev,
        city: selectedOption ? selectedOption.value : '',
      }));
    }}
    isSearchable={true}
    ref={selectRef}
    isDisabled={disabled}
    placeholder="Select a city"
    styles={{
      control: (base, state) => ({
        ...base,
        padding: "6px",
        borderRadius: "0.5rem",
        borderColor: state.isFocused ? "#5caaab" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 2px #5caaab66" : "none",
        "&:hover": {
          borderColor: "#5caaab",
        },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        zIndex: 20,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "#5caaab"
          : state.isFocused
          ? "#5caaab22"
          : "white",
        color: state.isSelected ? "white" : "black",
        padding: "10px 12px",
        cursor: "pointer",
      }),
    }}
  />
</div>
  
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold text-sm mb-1">
            Office Address
          </label>
          <input
            type="text"
            name="office_address"
            value={formData.office_address || ''}
            onChange={handleChange}
disabled={disabled}
            onKeyDown={handleKeyDown}
            className={commonInputClass}
          />
        </div>
  
        {/* Conditional Fields */}
        {renderConditionalFields()}
      </div>
  {!disabled && 
      <button
        type="submit"
        className="w-full bg-[#5CAAAB] hover:bg-[#489496] text-white py-3 rounded-md font-semibold transition"
      >
        Submit
      </button>
}
      </>)}
    </form>
  );
  
};

export default PromoterForm;