import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select';
import FileInputWithPreview from './FileInputWithPreview ';
import databaseService from '../../backend-services/database/database';

const projectTypeOptions = [
  { label: "Residential / Group Housing", value: "Residential / Group Housing" },
  { label: "Commercial", value: "Commercial" },
  { label: "Mixed", value: "Mixed" },
  { label: "Plotted", value: "Plotted" },
];


function ProjectDetailsForm({disabled, activeTab = '', formData, setFormData , handleSubmitProjectDetails, projectId}) {

  const [showPassword, setShowPassword] = useState(false);

  const [promotersForDropdown, setPromotersForDropdown] = useState([]);
  const [channelPartnersForDropdown, setChannelPartnersForDropdown] = useState([]);

useEffect(() => {
  const fetchPromoters = async () => {
    try {
      const data = await databaseService.getAllPromotersForDropdown();
      console.log("Promoters:", data);
      setPromotersForDropdown(data);
    } catch (error) {
      toast.error("❌ Failed to load promoters");
    }
  };
  const fetchChannelPartners = async () => {
    try {
      const data = await databaseService.getAllChannelPartnersForDropdown();
      console.log("ChannelPartners:", data);
      setChannelPartnersForDropdown(data);
    } catch (error) {
      toast.error("❌ Failed to load Channel Partners");
    }
  };

  fetchPromoters();
  fetchChannelPartners()
}, []);

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



        <div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select Channel Partner *</label>
  <Select
isDisabled={disabled}
    options={channelPartnersForDropdown}
    value={channelPartnersForDropdown.find(opt => opt.value === formData.channel_partner_id)}
    onChange={(selectedOption) => {
      setFormData((prev) => ({
        ...prev,
        channel_partner_id: selectedOption ? selectedOption.value : '',
      }));
    }}
    isSearchable={true}
    required={true}
    placeholder="Select a Channel Partner"
    ref={selectRef} // optional, only if you use it elsewhere
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

{/* <div className="flex flex-col">
  <label className="mb-2 font-medium">Promoter ID</label>
  <input
disabled={disabled}
    type="number"
    name="promoter_id"
    value={formData.promoter_id}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div> */}

<div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select Promoter *</label>
  <Select
isDisabled={disabled}
    options={promotersForDropdown}
    value={promotersForDropdown.find(opt => opt.value === formData.promoter_id)}
    onChange={(selectedOption) => {
      setFormData((prev) => ({
        ...prev,
        promoter_id: selectedOption ? selectedOption.value : '',
      }));
    }}
    isSearchable={true}
    required={true}
    placeholder="Select a promoter"
    ref={selectRef} // optional, only if you use it elsewhere
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
  <label className="mb-2 font-medium">Project Name *</label>
  <input
disabled={disabled}
    type="text"
    name="project_name"
    required
    value={formData.project_name}
    placeholder='Enter Project name'
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>


<div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select Project Type *</label>
  <Select
isDisabled={disabled}
    options={projectTypeOptions}
    value={projectTypeOptions.find(opt => opt.value === formData.project_type)}
    onChange={(selectedOption) => {
      setFormData((prev) => ({
        ...prev,
        project_type: selectedOption ? selectedOption.value : '',
      }));
    }}
    isSearchable={true}
    required={true}
    placeholder="Select Project Type"
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
  <label className="mb-2 font-medium">Project Address</label>
  <textarea
  disabled={disabled}
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
disabled={disabled}
    type='number'
    name="project_pincode"
    value={formData.project_pincode || ''}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Login ID</label>
  <input
disabled={disabled}
    type="text"
    name="login_id"
    value={formData.login_id}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col relative">
      <label className="mb-2 font-medium">Password</label>
      <input
disabled={disabled}
        type={showPassword ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={commonInputStyles}
        placeholder="Enter Password"
      />
      <button
        type="button"
        onClick={() => setShowPassword(prev => !prev)}
        className="absolute right-3 top-11 text-sm  font-bold text-red-500"
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    </div>

          <div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select District</label>
  <Select
isDisabled={disabled}
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
isDisabled={disabled}
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
disabled={disabled}
    type="text"
    name="rera_number"
    value={formData.rera_number}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<FileInputWithPreview
disabled={disabled}
  label="RERA Certificate"
  name="rera_certificate_uploaded_url"
  onChange={handleFileChange}
  filePreview={filePreviews.rera_certificate_uploaded_url}
  onDelete={() => handleFileDelete("rera_certificate_uploaded_url")}
/>


<div className="flex flex-col">
  <label className="mb-2 font-medium">Registration Date</label>
  <input
disabled={disabled}
    type="date"
    name="registration_date"
    value={formData.registration_date || ''}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Expiry Date</label>
  <input
disabled={disabled}
    type="date"
    name="expiry_date"
    value={formData.expiry_date || ''}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>





        </div>
        </div>
        {!disabled &&
        <button
        type="submit"
        className="w-fit px-5 m-0 bg-[#5CAAAB] hover:bg-[#489496] text-lg shadow-xl text-white py-3 rounded-xl self-end font-semibold transition"
      >
        Submit
      </button>
      }
        </form>
  )
}

export default ProjectDetailsForm