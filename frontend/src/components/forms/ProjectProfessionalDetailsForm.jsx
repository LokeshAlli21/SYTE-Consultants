import React, { useState, useEffect } from 'react';
import FileInputWithPreview from './FileInputWithPreview ';

function ProjectProfessionalDetailsForm({disabled, projectId, activeTab = '', formData, setFormData, handleSubmitProjectProfessionalDetails }) {
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
  
      console.log("✅ Uploaded URLs:", uploadedUrls);
  
      if (Object.keys(uploadedUrls).length > 0) {
        setFilePreviews(uploadedUrls);
      }
    },[formData])

  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  const renderProfessionalSection = (roleLabel, roleKey) => {
    const data = formData[roleKey] || {};
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-[#4a9899] mb-4">{roleLabel}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* <div className="flex flex-col w-full">
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
          </div> */}

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

          {[
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

      {renderProfessionalSection("Engineer", "engineer")}
      {renderProfessionalSection("Architect", "architect")}
      {renderProfessionalSection("Chartered Accountant", "ca")}

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
