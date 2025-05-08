import React, { useState, useEffect } from 'react';
import FileInputWithPreview from './FileInputWithPreview ';
import Select from 'react-select';

function ProjectProfessionalDetailsForm({
  disabled, 
  projectId, 
  activeTab = '', 
  formData, 
  setFormData, 
  handleSubmitProjectProfessionalDetails,
  engineerOptions,
  architectOptions,
  casOptions,
}) {
  const [filePreviews, setFilePreviews] = useState({});


  const handleChange = (e, role) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [name]: value
      }
    }));
  };

  const handleFileChange = (e, role) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      setFormData(prev => ({
        ...prev,
        [role]: {
          ...prev[role],
          [name]: file
        }
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({
          ...prev,
          [`${role}_${name}`]: { url: reader.result, type: file.type }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDelete = (role, name) => {
    setFormData(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [name]: null
      }
    }));

    setFilePreviews(prev => {
      const updated = { ...prev };
      delete updated[`${role}_${name}`];
      return updated;
    });
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
    const confirmed = window.confirm('Are you sure you want to submit?');
    if (confirmed) {
      handleSubmitProjectProfessionalDetails();
    }
  };  

    useEffect(() => {
      const uploadedUrls = {};


      Object.entries(formData || {}).forEach((detail) => {
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

  
      // Object.entries(formData || {}).forEach(([key, value]) => {
      //   if (
      //     typeof key === "string" &&
      //     key.endsWith("_uploaded_url") &&
      //     typeof value === "string" &&
      //     value.startsWith("http")
      //   ) {
      //     uploadedUrls[key] = value;
      //   }
      // });
  
      // console.log("✅ Uploaded URLs:", uploadedUrls);
  
      if (Object.keys(uploadedUrls).length > 0) {
        setFilePreviews(uploadedUrls);
      }
    },[formData])

  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

    const renderProfessionalSection = (roleLabel, roleKey, roleKeyForId) => {
      const data = formData[roleKey] || {};
      const isSelecting = formData[`${roleKey}_isSelecting`] ?? true;
    
      const roleOptionsMap = {
        engineer: engineerOptions,
        architect: architectOptions,
        ca: casOptions
      };
      const roleOptions = roleOptionsMap[roleKey];
    
      return (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-[#4a9899] mb-4">{roleLabel}</h2>
    
          {/* Toggle Selection Mode */}
          { !disabled && <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isSelecting}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    [`${roleKey}_isSelecting`]: true,
                  }))
                }
              />
              Select from List
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isSelecting}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    [`${roleKey}_isSelecting`]: false,
                    [roleKeyForId]: '', // Clear selection
                  }))
                }
              />
              Add New
            </label>
          </div>}
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dropdown */}
            {(isSelecting && !disabled) ? (
              <div className="flex flex-col w-full">
                <label className="mb-2 font-medium text-gray-700">Select {roleLabel} *</label>
                <Select
                  isDisabled={disabled}
                  options={roleOptions}
                  value={roleOptions.find(opt => opt.value === data?.id)}
                  onChange={(selectedOption) => {
                    const selected = selectedOption || {};
                    setFormData((prev) => ({
                      ...prev,
                      [roleKeyForId]: selected.value || '',
                    }));
                  }}
                  isSearchable
                  required
                  placeholder={`Select a ${roleLabel.toLowerCase()}`}
                  styles={/* your styles here */ {}}
                />
              </div>
            ) : (
              <>
                {['name', 'contact_number', 'email_id', 'office_address', 'licence_number', 'pan_number'].map(field => (
                  <div className="flex flex-col" key={field}>
                    <label className="mb-2 font-medium capitalize">{field.replace(/_/g, ' ')}</label>
                    <input
                      disabled={disabled}
                      type="text"
                      name={field}
                      value={data[field] || ''}
                      onChange={(e) => handleChange(e, roleKey)}
                      onKeyDown={handleKeyDown}
                      className={commonInputStyles}
                    />
                  </div>
                ))}
    
                {[ // File Inputs
                  { name: 'licence_uploaded_url', label: 'Licence File' },
                  { name: 'pan_uploaded_url', label: 'PAN File' },
                  { name: 'letter_head_uploaded_url', label: 'Letterhead' },
                  { name: 'sign_stamp_uploaded_url', label: 'Sign/Stamp' }
                ].map(({ name, label }) => (
                  <FileInputWithPreview
                    disabled={disabled}
                    key={name}
                    label={label}
                    name={name}
                    onChange={(e) => handleFileChange(e, roleKey)}
                    filePreview={filePreviews[`${roleKey}_${name}`]}
                    onDelete={() => handleFileDelete(roleKey, name)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      );
    };
    
    

  if(!projectId){
    return
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="py-2 px-6 bg-[#5CAAAB] rounded-xl">
        <h1 className="text-2xl font-bold text-white">{activeTab}</h1>
      </div>

      {renderProfessionalSection("Engineer", "engineer", "engineer_id")}
      {renderProfessionalSection("Architect", "architect", "architect_id")}
      {renderProfessionalSection("Chartered Accountant", "ca", "ca_id")}

      {!disabled &&
      <button
        type="submit"
        className="w-fit self-end px-5 py-3 bg-[#5CAAAB] hover:bg-[#489496] text-lg text-white rounded-xl font-semibold shadow-xl transition"
      >
        Submit
      </button>
}
    </form>
  );
}

export default ProjectProfessionalDetailsForm;
