import React, { useState } from 'react';
import FileInputWithPreview from './FileInputWithPreview ';
import Select from 'react-select';

const unitTypeOptions = [
  { value: '1 BHK', label: '1 BHK' },
  { value: '2 BHK', label: '2 BHK' },
  { value: '3 BHK', label: '3 BHK' },
  { value: '4 BHK', label: '4 BHK' },
  { value: '5 BHK', label: '5 BHK' },
  { value: 'shop', label: 'Shop' },
  { value: 'office', label: 'Office' },
  { value: 'plot', label: 'Plot' },
];

const unitStatusOptions = [
  { value: 'booked', label: 'Booked' },
  { value: 'sold', label: 'Sold' },
  { value: 'unsold', label: 'Unsold' },
];


function UnitDetailsForm({ setIsUnitDetailsFormActive, formData, setFormData,handleSubmitProjectUnit }) {

      const [filePreviews, setFilePreviews] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle financial year input change (to handle received amounts for each year)
  const handleFyChange = (e, year) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [`received_fy_${year}`]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to submit?');
    if (confirmed) {
      handleSubmitProjectUnit();
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

  // Common input styles
  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  return (
    <div className="p-0 bg-white rounded-2xl shadow-md relative" >
      <div className='p-2 bg-[#5CAAAB] rounded-t-2xl  px-6'>
        <h1 className="text-2xl  font-bold text-white">Add Unit Details</h1>
      </div>
      <form className=" p-6  space-y-6"  onSubmit={handleSubmit}>

        {/* Unit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className='flex flex-col'>
            <label className="mb-2 font-medium">Unit Name</label>
            <input
              type="text"
              name="unit_name"
              value={formData.unit_name}
              onChange={handleChange}
              className={commonInputStyles}
            />
          </div>
          <div className="flex flex-col">
  <label className="mb-2 font-medium">Unit Type</label>
  <Select
    options={unitTypeOptions}
    value={unitTypeOptions.find(opt => opt.value === formData.unit_type)}
    onChange={(selectedOption) =>
      setFormData((prev) => ({
        ...prev,
        unit_type: selectedOption ? selectedOption.value : '',
      }))
    }
    isSearchable={true}
    placeholder="Select Unit Type"
    styles={{
      control: (base, state) => ({
        ...base,
        padding: '6px',
        borderRadius: '0.5rem',
        borderColor: state.isFocused ? '#5caaab' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 2px #5caaab66' : 'none',
        '&:hover': {
          borderColor: '#5caaab',
        },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: '0.5rem',
        zIndex: 20,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? '#5caaab'
          : state.isFocused
          ? '#5caaab22'
          : 'white',
        color: state.isSelected ? 'white' : 'black',
        padding: '10px 12px',
        cursor: 'pointer',
      }),
    }}
  />
</div>




<div className='flex flex-col'>
          <label className="mb-2 font-medium">Carpet Area</label>
          <input
            type="number"
            name="carpet_area"
            value={formData.carpet_area}
            onChange={handleChange}
            className={commonInputStyles}
          /></div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Unit Status</label>
  <Select
    options={unitStatusOptions}
    value={unitStatusOptions.find(opt => opt.value === formData.unit_status)}
    onChange={(selectedOption) =>
      setFormData((prev) => ({
        ...prev,
        unit_status: selectedOption ? selectedOption.value : '',
      }))
    }
    isSearchable={false}
    placeholder="Select Unit Status"
    styles={{
      control: (base, state) => ({
        ...base,
        padding: '6px',
        borderRadius: '0.5rem',
        borderColor: state.isFocused ? '#5caaab' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 2px #5caaab66' : 'none',
        '&:hover': {
          borderColor: '#5caaab',
        },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: '0.5rem',
        zIndex: 20,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? '#5caaab'
          : state.isFocused
          ? '#5caaab22'
          : 'white',
        color: state.isSelected ? 'white' : 'black',
        padding: '10px 12px',
        cursor: 'pointer',
      }),
    }}
  />
</div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className='flex flex-col'>
          <label className="mb-2 font-medium">Customer Name</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            className={commonInputStyles}
          /></div>

<div className='flex flex-col'>
          <label className="mb-2 font-medium">Agreement Value</label>
          <input
            type="number"
            name="agreement_value"
            value={formData.agreement_value}
            onChange={handleChange}
            className={commonInputStyles}
          /></div>

<div className='flex flex-col'>
          <label className="mb-2 font-medium">Agreement or Sale Deed Date</label>
          <input
            type="date"
            name="agreement_or_sale_deed_date"
            value={formData.agreement_or_sale_deed_date}
            onChange={handleChange}
            className={commonInputStyles}
          /></div>
        </div>

        {/* Financial Year Received Amounts */}
        <div className="grid grid-cols-2 gap-4">
          {['2018_19', '2019_20', '2020_21', '2021_22', '2022_23', '2023_24', '2024_25', '2025_26', '2026_27', '2027_28', '2028_29', '2029_30'].map((year) => (
            <div className="flex flex-col" key={year}>
              <label className="mb-2 font-medium">Received FY {year}</label>
              <input
                type="number"
                name={`received_fy_${year}`}
                value={formData[`received_fy_${year}`]}
                onChange={(e) => handleFyChange(e, year)}
                className={commonInputStyles}
              />
            </div>
          ))}
        </div>

        {/* uplods */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

        <FileInputWithPreview
  label="Upload AFS"
  name="afs_uploaded_url"
  onChange={handleFileChange}
  filePreview={filePreviews.afs_uploaded_url}
  onDelete={() => handleFileDelete("afs_uploaded_url")}
/>
<FileInputWithPreview
  label="Upload Sale Deed"
  name="sale_deed_uploaded_url"
  onChange={handleFileChange}
  filePreview={filePreviews.sale_deed_uploaded_url}
  onDelete={() => handleFileDelete("sale_deed_uploaded_url")}
/>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end items-center">
          <button
            type="submit"
            className="px-6 py-3 bg-[#5CAAAB] text-white rounded-lg shadow-md hover:bg-[#489496]"
          >
            Submit
          </button>
          <button
            className="px-6 absolute top-4 right-4 py-3 bg-red-400 hover:bg-red-500 border-0 shadow-lg text-white rounded-lg"
            onClick={() => setIsUnitDetailsFormActive(false)}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default UnitDetailsForm;
