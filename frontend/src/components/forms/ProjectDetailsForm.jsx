import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select';
import FileInputWithPreview from './FileInputWithPreview ';
import databaseService from '../../backend-services/database/database';

function ProjectDetailsForm({ activeTab = '', formData, setFormData , handleSubmitProjectDetails}) {
    const selectRef = useRef(null);

    const [filePreviews, setFilePreviews] = useState({});

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
    

    
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKeyDown = (e) => {
    e.preventDefault();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const confirmed = window.confirm('Are you sure you want to submit?');
        if (confirmed) {
          handleSubmitProjectDetails()
        }
      };

    const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  return (
    <form
    onSubmit={handleSubmit}
     className="flex flex-col gap-4 ">
        <div className='flex flex-col gap-4 bg-white p-0 rounded-2xl shadow-md'>
        <div className='py-2 px-6 relative rounded-t-2xl bg-[#5CAAAB]'>
          <h1 className='text-2xl font-bold text-white'>{activeTab}</h1>
        </div>
        <div className='p-6 pt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'> 



<div className="flex flex-col">
  <label className="mb-2 font-medium">Channel Partner</label>
  <input
    type="text"
    name="channel_partner"
    value={formData.channel_partner}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>

{/* <div className="flex flex-col">
  <label className="mb-2 font-medium">Promoter ID</label>
  <input
    type="number"
    name="promoter_id"
    value={formData.promoter_id}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div> */}

<div className="flex flex-col">
  <label className="mb-2 font-medium">Select Promoter</label>
  <input
    type="text"
    name="promoter_name"
    value={formData.promoter_name}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Project Name *</label>
  <input
    type="text"
    name="project_name"
    required
    value={formData.project_name}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Project Type</label>
  <input
    type="text"
    name="project_type"
    value={formData.project_type}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Project Address</label>
  <textarea
    name="project_address"
    value={formData.project_address}
    onChange={handleChange}
    rows={3}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Project Pincode</label>
  <input
    type='number'
    name="project_pincode"
    value={formData.project_pincode}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Login ID</label>
  <input
    type="text"
    name="login_id"
    value={formData.login_id}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Password</label>
  <input
    type="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

          <div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select District</label>
  <Select
    options={districtOptions} // This should be the array of districts
    value={districtOptions.find(opt => opt.value === formData.district)}
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
  <label className="mb-2 font-medium text-gray-700">Select City</label>
  <Select
    options={cityOptions} // This should be the array of cities
    value={cityOptions.find(opt => opt.value === formData.city)}
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

<div className="flex flex-col">
  <label className="mb-2 font-medium">RERA Number</label>
  <input
    type="text"
    name="rera_number"
    value={formData.rera_number}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<FileInputWithPreview
  label="RERA Certificate"
  name="rera_certificate_uploaded_url"
  onChange={handleFileChange}
  filePreview={filePreviews.rera_certificate_uploaded_url}
  onDelete={() => handleFileDelete("rera_certificate_uploaded_url")}
/>


<div className="flex flex-col">
  <label className="mb-2 font-medium">Registration Date</label>
  <input
    type="date"
    name="registration_date"
    value={formData.registration_date}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Expiry Date</label>
  <input
    type="date"
    name="expiry_date"
    value={formData.expiry_date}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>





        </div>
        </div>
        <button
        type="submit"
        className="w-fit px-5 m-0 bg-[#5CAAAB] hover:bg-[#489496] text-lg shadow-xl text-white py-3 rounded-xl self-end font-semibold transition"
      >
        Submit
      </button>
        </form>
  )
}

export default ProjectDetailsForm