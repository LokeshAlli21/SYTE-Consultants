import React, { useEffect, useState } from 'react';
import FileInputWithPreview from './FileInputWithPreview ';
import databaseService from '../../backend-services/database/database';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

const PromoterForm = ({id}) => { 

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
    aadhar_number: '',
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
    console.log('Form Data:', formData);
    setLoading(true);
    try {
      const response = await databaseService.uploadPromoterData(formData);
      console.log("✅ Upload response:", response);
      toast.success("✅ Promoter created successfully!");
      navigate("/promoters"); // 👈 Navigate on success
    } catch (error) {
      console.error("❌ Error creating Promoter:", error);
      toast.error(`❌ Failed to create Promoter: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
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
  const fetchPromoterData = async (id) => {
    try {
      const result = await databaseService.getPromoterDetailsById(id);

      // Extract data, exclude URLs, and update formData
      const { promoter_name, contact_number, email_id, district, city, promoter_type } = result;
      const {
        full_name,
        aadhar_number,
        office_address,
        pan_number,
        dob,
        contact_person_name,
        partnership_pan_number,
        company_pan_number,
        company_incorporation_number
      } = result.promoterdetails[0]; // Accessing the first (and only) item in the array

      setFormData({
        promoter_name,
        contact_number,
        email_id,
        district,
        city,
        office_address,
        promoter_type,
        full_name,
        aadhar_number,
        aadhar_uploaded_url: '',  // Leave empty or do not set
        pan_number,
        pan_uploaded_url: '',  // Leave empty or do not set
        dob,
        contact_person_name,
        partnership_pan_number,
        partnership_pan_uploaded_url: '',  // Leave empty or do not set
        company_pan_number,
        company_pan_uploaded_url: '',  // Leave empty or do not set
        company_incorporation_number,
        company_incorporation_uploaded_url: '',  // Leave empty or do not set
        promoter_photo_uploaded_url: '',
      });
    } catch (error) {
      console.error("Error fetching promoter details:", error);
      toast.error("Failed to fetch promoter details.");
    }
  };

  if (id !== null) {
    fetchPromoterData(id);
  }
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
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Aadhar Number</label>
              <input
                type="text"
                name="aadhar_number"
                value={formData.aadhar_number}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload Aadhar Document"
              name="aadhar_uploaded_url"
              onChange={handleFileChange}
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
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload PAN Document"
              name="pan_uploaded_url"
              onChange={handleFileChange}
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
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload Partnership PAN Document"
              name="partnership_pan_uploaded_url"
              onChange={handleFileChange}
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
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload Company PAN Document"
              name="company_pan_uploaded_url"
              onChange={handleFileChange}
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
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <FileInputWithPreview
              label="Upload Company Incorporation Document"
              name="company_incorporation_uploaded_url"
              onChange={handleFileChange}
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
            onKeyDown={handleKeyDown}
            required
            className={commonInputClass}
          />
        </div>
  
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold text-sm mb-1">
            Promoter Type *
          </label>
          <select
            name="promoter_type"
            value={formData.promoter_type}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
            className={commonInputClass}
          >
            <option value="">Select Promoter Type</option>
            <option value="individual">Individual</option>
            <option value="partnership_firm">Partnership Firm</option>
            <option value="pvt_ltd">PVT LTD</option>
          </select>
        </div>
  
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold text-sm mb-1">
            District *
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
            className={commonInputClass}
          />
        </div>

        <FileInputWithPreview
              label="Upload Photo"
              name="promoter_photo_uploaded_url"
              onChange={handleFileChange}
              filePreview={filePreviews.promoter_photo_uploaded_url}
              onDelete={() => handleFileDelete("promoter_photo_uploaded_url")}
            />
  
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold text-sm mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
            className={commonInputClass}
          />
        </div>
  
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold text-sm mb-1">
            Office Address
          </label>
          <input
            type="text"
            name="office_address"
            value={formData.office_address}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={commonInputClass}
          />
        </div>
  
        {/* Conditional Fields */}
        {renderConditionalFields()}
      </div>
  
      <button
        type="submit"
        className="w-full bg-[#5CAAAB] hover:bg-[#489496] text-white py-3 rounded-md font-semibold transition"
      >
        Submit
      </button>
      </>)}
    </form>
  );
  
};

export default PromoterForm;