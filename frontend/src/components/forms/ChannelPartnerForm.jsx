import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import databaseService from '../../backend-services/database/database';

function ChannelPartnerForm({ formData, setFormData, handleSubmitChannelPartner, activeTab = "Channel Partner Details" }) {
  const selectRef = useRef(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
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

          <div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select District *</label>
  <Select
    options={districtOptions} // This should be the array of districts
    value={districtOptions.find(opt => opt.value === formData.district)}
    required={true}
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
