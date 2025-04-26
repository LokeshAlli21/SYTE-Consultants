import React, { useState } from 'react';

const PromoterForm = () => {
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
    profile_photo_url: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // TODO: Send to backend API
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1]?.focus();
    }
  };

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
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
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
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Aadhar Document URL</label>
              <input
                type="text"
                name="aadhar_uploaded_url"
                value={formData.aadhar_uploaded_url}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">PAN Document URL</label>
              <input
                type="text"
                name="pan_uploaded_url"
                value={formData.pan_uploaded_url}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
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
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
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
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>
          </>
        );
      case 'partnership_firm':
        return (
          <>
            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Contact Person Name</label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Partnership PAN Number</label>
              <input
                type="text"
                name="partnership_pan_number"
                value={formData.partnership_pan_number}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Partnership PAN Document URL</label>
              <input
                type="text"
                name="partnership_pan_uploaded_url"
                value={formData.partnership_pan_uploaded_url}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Email ID</label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>
          </>
        );
      case 'pvt_ltd':
        return (
          <>
            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Contact Person Name</label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Company PAN Number</label>
              <input
                type="text"
                name="company_pan_number"
                value={formData.company_pan_number}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Company PAN Document URL</label>
              <input
                type="text"
                name="company_pan_uploaded_url"
                value={formData.company_pan_uploaded_url}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Company Incorporation Number</label>
              <input
                type="text"
                name="company_incorporation_number"
                value={formData.company_incorporation_number}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Company Incorporation Document URL</label>
              <input
                type="text"
                name="company_incorporation_uploaded_url"
                value={formData.company_incorporation_uploaded_url}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>

            <div className="flex flex-col w-full max-w-[45%]">
              <label className="mb-2 font-medium">Email ID</label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-[#5CAAAB]">Promoter Information</h2>
      <div className="flex flex-wrap w-full gap-4 items-center justify-center p-0">

        {/* Common Fields */}
        <div className="flex flex-col w-full max-w-[45%]">
          <label className="mb-2 font-medium">Promoter Name *</label>
          <input
            type="text"
            name="promoter_name"
            value={formData.promoter_name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
            className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
          />
        </div>

        <div className="flex flex-col w-full max-w-[45%]">
          <label className="mb-2 font-medium">Promoter Type *</label>
          <select
            name="promoter_type"
            value={formData.promoter_type}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
            className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
          >
            <option value="">Select Promoter Type</option>
            <option value="individual">Individual</option>
            <option value="partnership_firm">Partnership Firm</option>
            <option value="pvt_ltd">PVT LTD</option>
          </select>
        </div>

        <div className="flex flex-col w-full max-w-[45%]">
          <label className="mb-2 font-medium">District *</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
            className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
          />
        </div>

        <div className="flex flex-col w-full max-w-[45%]">
          <label className="mb-2 font-medium">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
            className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
          />
        </div>

        <div className="flex flex-col w-full max-w-[45%]">
          <label className="mb-2 font-medium">Office Address</label>
          <input
            type="text"
            name="office_address"
            value={formData.office_address}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-[#5CAAAB] transition"
          />
        </div>


        {renderConditionalFields()}
      </div>

      <button
        type="submit"
        className="bg-[#5CAAAB] text-white px-6 w-full py-3 rounded-lg shadow hover:bg-[#489496] transition"
      >
        Submit
      </button>
    </form>
  );
};

export default PromoterForm;
