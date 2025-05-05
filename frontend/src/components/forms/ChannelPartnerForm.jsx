import React from 'react';

function ChannelPartnerForm({ formData, setFormData, handleSubmitChannelPartner, activeTab = "Channel Partner Details" }) {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Manual validation
    if (!formData.full_name) {
      alert("Please fill in all required fields.");
      return;
    }
  
    const confirmed = window.confirm("Are you sure you want to submit?");
    if (confirmed) {
      handleSubmitChannelPartner();
    }
  };
  

  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-white rounded-xl">
        <div className="py-2 px-6 bg-[#5CAAAB] rounded-t-xl">
          <h1 className="text-2xl font-bold text-white">{activeTab}</h1>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="mb-2 font-medium">Full Name *</label>
            <input
            required={true}
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={commonInputStyles}
              placeholder="Enter full name"
              
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium">Contact Number</label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={commonInputStyles}
              placeholder="Primary contact number"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium">Alternate Contact Number</label>
            <input
              type="tel"
              name="alternate_contact_number"
              value={formData.alternate_contact_number}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={commonInputStyles}
              placeholder="Secondary contact number"
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
              className={commonInputStyles}
              placeholder="e.g. abc@xyz.com"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={commonInputStyles}
              placeholder="District name"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={commonInputStyles}
              placeholder="City name"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-fit self-end px-5 py-3 bg-[#5CAAAB] hover:bg-[#489496] text-lg text-white rounded-xl font-semibold shadow-xl transition"
      >
        Submit
      </button>
    </form>
  );
}

export default ChannelPartnerForm;
