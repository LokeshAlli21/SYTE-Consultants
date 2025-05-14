import React, { useState, useEffect } from 'react';
import FileInputWithPreview from './FileInputWithPreview ';
import Select from 'react-select';
import databaseService from '../../backend-services/database/database';

function ProjectProfessionalDetailsForm({
  disabled, 
  projectId, 
  activeTab = '', 
  formData, 
  setFormData, 
  handleSubmitProjectProfessionalDetails,

  engineerOptions,
  setEngineerOptions,
  architectOptions,
  setArchitectOptions,
  casOptions,
  setCAsOptions,

  engineerData,
  setEngineerData,
  handleSubmitEngineer,

  architectData,
  setArchitectData,
  handleSubmitArchitect,

  caData,
  setCAData,
  handleSubmitCA,
}) {
  const [filePreviews, setFilePreviews] = useState({});


  // const handleChange = (e, role) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [role]: {
  //       ...prev[role],
  //       [name]: value
  //     }
  //   }));
  // };

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


  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

    const renderProfessionalSection = (
      roleLabel,
      roleKey,             // e.g. "engineer"
      roleKeyForId,         // e.g. "engineer_id"
      roleData,
      setRoleData,
      handleSubmitRole,
      roleOptions
    ) => {

      useEffect(() => {
        const uploadedUrls = {};
  
            Object.entries(roleData || {}).forEach(([key, value]) => {
              if (
                typeof key === "string" &&
                key.endsWith("_uploaded_url") &&
                typeof value === "string" &&
                value.startsWith("http")
              ) {
                uploadedUrls[`${roleKey}_${key}`] = value;
              }
            });
    
        if (Object.keys(uploadedUrls).length > 0) {
          setFilePreviews(uploadedUrls);
        }
        // console.log(uploadedUrls);
        
      },[roleData])
  


      const [modeState, setModeState] = useState('select')
      
      const mode = modeState[roleKey] || 'select';
    
      const handleModeChange = (newMode) => {
        setModeState(prev => ({
          ...prev,
          [roleKey]: newMode,
        }));
    
        if (newMode === 'none') {
          setFormData(prev => ({
            ...prev,
            [roleKeyForId]: '',
          }));
        }
      };
    
      const handleAddSubmit = async () => {
        if(await handleSubmitRole()) {
          
        setModeState(prev => ({
          ...prev,
          [roleKey]: 'select',
        }));
        }
        
        setFilePreviews({})

        const mapToOptions = (data) =>
          data.map((item) => ({
            label: item.name || `ID ${item.id}`,
            value: item.id,
          }));

        async function fetchOptions() {
          try {
            const engineers = await databaseService.getAllEngineers();
            setEngineerOptions(mapToOptions(engineers));
          } catch (error) {
            console.error("Error fetching engineers:", error);
          }
    
          try {
            const architects = await databaseService.getAllArchitects();
            setArchitectOptions(mapToOptions(architects));
          } catch (error) {
            console.error("Error fetching architects:", error);
          }
    
          try {
            const cas = await databaseService.getAllCAs();
            setCAsOptions(mapToOptions(cas));
          } catch (error) {
            console.error("Error fetching CAs:", error);
          }
        }
    
        fetchOptions();

      };
    
      return (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-[#4a9899] mb-4">{roleLabel}</h2>
    
          {!disabled && (
            <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={mode === 'select'}
                onChange={() => handleModeChange('select')}
              />
              Select from List
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={mode === 'none'}
                onChange={() => handleModeChange('none')}
              />
              No {roleLabel}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={mode === 'add'}
                onChange={() => handleModeChange('add')}
              />
              Add New
            </label>
          </div>
          
          )}
    
          {/* --- SELECT MODE --- */}
          {mode === 'select' && !disabled && (
            <div className="mb-4">
              <label className="mb-2 block font-medium text-gray-700">Select {roleLabel} *</label>
              <Select
                isDisabled={disabled}
                options={roleOptions}
                onKeyDown={handleKeyDown}
                value={roleOptions.find(opt => opt.value === formData[roleKeyForId])}
                onChange={(selectedOption) => {
                  setFormData(prev => ({
                    ...prev,
                    [roleKeyForId]: selectedOption?.value || '',
                  }));
                }}
                placeholder={`Select a ${roleLabel.toLowerCase()}`}
                isClearable
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
          )}
    
          {/* --- ADD MODE --- */}

          {(disabled) && !roleData?.name && (
            <div className="flex justify-center items-center py-">
              <div className="bg-red-50  text-red-700 px-6 py-4 rounded-xl  w-full ">
                <h3 className="text-center font-semibold text-lg">
                  🚫 <span className="font-bold">{roleLabel}</span> is not available.
                </h3>
              </div>
            </div>
          )}

          {(mode === 'add' || disabled) && !((disabled) && !roleData?.name) &&(
            <>
            <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
              {['name', 'contact_number', 'email_id', 'office_address', 'licence_number', 'pan_number'].map(field => (
                <div className="flex flex-col mb-4" key={field}>
                  <label className="mb-1 font-medium capitalize">{field.replace(/_/g, ' ')}</label>
                  <input
                    type="text"
                    name={field}
                    disabled={disabled}
                    value={roleData[field]}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setRoleData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
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
                  key={name}
                  label={label}
                  name={name}
                  disabled={disabled}
                  // onDelete={() => handleFileDelete("rera_certificate_uploaded_url")}
                  filePreview={filePreviews[`${roleKey}_${name}`]}
                  onChange={(e) => {

                    const { name, files } = e.target;
                      const file = files[0];
                  
                      if (file) {
                        setRoleData(prev => ({ ...prev, [name]: file }));
                  
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFilePreviews(prev => ({
                            ...prev,
                            [`${roleKey}_${name}`]: { url: reader.result, type: file.type }
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                  }}
                  onDelete={() => {
                    setFilePreviews(prev => {
                      const updated = { ...prev };
                      delete updated[`${roleKey}_${name}`];
                      return updated;
                    });
                    setRoleData(prev => ({ ...prev, [name]: null }));
                  }}
                />
              ))}
    
              
            </div>
            { !disabled && 
            <button
            type="button"
            onClick={handleAddSubmit}
            className="bg-[#5caaab] hover:bg-[#4a9899] text-white float-end px-4 py-2 mt-4 rounded"
          >
            Save & Go to Select
          </button>
    }
          </>
          )}
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

      {renderProfessionalSection('Engineer', 'engineer', 'engineer_id', engineerData, setEngineerData, handleSubmitEngineer, engineerOptions)}
      {renderProfessionalSection('Architect', 'architect', 'architect_id', architectData, setArchitectData, handleSubmitArchitect, architectOptions)}
      {renderProfessionalSection('CA', 'ca', 'ca_id', caData, setCAData, handleSubmitCA, casOptions)}


      {!disabled &&
      <button
        type="submit"
        className="mt-6 bg-[#5caaab] hover:bg-[#4a9899] text-white px-6 py-3 rounded-lg font-semibold"
      >
        Save All
      </button>
}
    </form>
  );
}

export default ProjectProfessionalDetailsForm;
