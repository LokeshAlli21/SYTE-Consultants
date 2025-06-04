import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FileInputWithPreview from './FileInputWithPreview ';
import Select from 'react-select';
import databaseService from '../../backend-services/database/database';
import UpdateInfoComponent from '../UpdateInfoComponent';

const commonInputStyles = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

const SELECT_STYLES = {
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
};

// Extracted ProfessionalSection as a separate memoized component
const ProfessionalSection = React.memo(({
  roleLabel,
  roleKey,
  roleKeyForId,
  roleData,
  setRoleData,
  handleSubmitRole,
  roleOptions,
  disabled,
  formData,
  setFormData,
  filePreviews,
  setFilePreviews,
  onRefreshOptions
}) => {
  const [mode, setMode] = useState('select');

  // Initialize file previews when component mounts or roleData changes
  useEffect(() => {
    const uploadedUrls = {};
    Object.entries(roleData || {}).forEach(([key, value]) => {
      if (
        typeof key === "string" &&
        key.endsWith("_uploaded_url") &&
        typeof value === "string" &&
        value.startsWith("http")
      ) {
        uploadedUrls[`${roleKey}_${key}`] = { url: value, type: 'application/pdf' };
      }
    });

    if (Object.keys(uploadedUrls).length > 0) {
      setFilePreviews(prev => ({ ...prev, ...uploadedUrls }));
    }
  }, [roleData, roleKey, setFilePreviews]);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    if (newMode === 'none') {
      setFormData(prev => ({
        ...prev,
        [roleKeyForId]: '',
      }));
    }
  }, [roleKeyForId, setFormData]);

  const handleSelectChange = useCallback((selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [roleKeyForId]: selectedOption?.value || '',
    }));
  }, [roleKeyForId, setFormData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setRoleData(prev => ({ ...prev, [name]: value }));
  }, [setRoleData]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      if (form) {
        const index = Array.prototype.indexOf.call(form.elements, e.target);
        const nextElement = form.elements[index + 1];
        if (nextElement && nextElement.focus) {
          nextElement.focus();
        }
      }
    }
  }, []);

  const handleFileChange = useCallback((name) => (e) => {
    const { files } = e.target;
    const file = files[0];

    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and PDF files are allowed");
        return;
      }

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
  }, [setRoleData, setFilePreviews, roleKey]);

  const handleFileDelete = useCallback((name) => {
    setFilePreviews(prev => {
      const updated = { ...prev };
      delete updated[`${roleKey}_${name}`];
      return updated;
    });
    setRoleData(prev => ({ ...prev, [name]: null }));
  }, [setFilePreviews, setRoleData, roleKey]);

  const handleAddSubmit = useCallback(async () => {
    const success = await handleSubmitRole();
    if (success) {
      setMode('select');
      // Clear file previews for this role
      setFilePreviews(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (key.startsWith(`${roleKey}_`)) {
            delete updated[key];
          }
        });
        return updated;
      });
      // Refresh options
      if (onRefreshOptions) {
        onRefreshOptions();
      }
    }
  }, [handleSubmitRole, setFilePreviews, roleKey, onRefreshOptions]);

  const inputFields = useMemo(() => [
    'name', 'contact_number', 'email_id', 'office_address', 'licence_number', 'pan_number'
  ], []);

  const fileFields = useMemo(() => [
    { name: 'licence_uploaded_url', label: 'Licence File' },
    { name: 'pan_uploaded_url', label: 'PAN File' },
    { name: 'letter_head_uploaded_url', label: 'Letterhead' },
    { name: 'sign_stamp_uploaded_url', label: 'Sign/Stamp' }
  ], []);

  const selectedValue = useMemo(() => 
    roleOptions.find(opt => opt.value === formData[roleKeyForId]) || null,
    [roleOptions, formData, roleKeyForId]
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-white/20">
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

      {/* SELECT MODE */}
      {mode === 'select' && !disabled && (
        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-700">Select {roleLabel} *</label>
          <Select
            isDisabled={disabled}
            options={roleOptions}
            onKeyDown={handleKeyDown}
            value={selectedValue}
            onChange={handleSelectChange}
            placeholder={`Select a ${roleLabel.toLowerCase()}`}
            isClearable
            styles={SELECT_STYLES}
          />
        </div>
      )}

      {/* NO DATA AVAILABLE MESSAGE */}
      {disabled && !roleData?.name && (
        <div className="flex justify-center items-center">
          <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl w-full">
            <h3 className="text-center font-semibold text-lg">
              🚫 <span className="font-bold">{roleLabel}</span> is not available.
            </h3>
          </div>
        </div>
      )}

      {/* ADD MODE OR VIEW MODE WITH DATA */}
      {(mode === 'add' || disabled) && !((disabled) && !roleData?.name) && (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
            {inputFields.map(field => (
              <div className="flex flex-col mb-4" key={field}>
                <label className="mb-1 font-medium capitalize">
                  {field.replace(/_/g, ' ')}
                </label>
                <input
                  type="text"
                  name={field}
                  disabled={disabled}
                  value={roleData[field] || ''}
                  onKeyDown={handleKeyDown}
                  onChange={handleInputChange}
                  className={commonInputStyles}
                />
              </div>
            ))}

            {fileFields.map(({ name, label }) => (
              <FileInputWithPreview
                key={name}
                label={label}
                name={name}
                disabled={disabled}
                filePreview={filePreviews[`${roleKey}_${name}`]}
                onChange={handleFileChange(name)}
                onDelete={() => handleFileDelete(name)}
              />
            ))}
          </div>
          
          {!disabled && (
            <button
              type="button"
              onClick={handleAddSubmit}
              className="bg-[#5caaab] hover:bg-[#4a9899] text-white float-end px-4 py-2 mt-4 rounded transition-colors duration-200"
            >
              Save & Go to Select
            </button>
          )}
        </>
      )}
    </div>
  );
});

ProfessionalSection.displayName = 'ProfessionalSection';

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

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to submit?');
    if (confirmed) {
      handleSubmitProjectProfessionalDetails();
    }
  }, [handleSubmitProjectProfessionalDetails]);

  // Memoized function to refresh all options
  const refreshAllOptions = useCallback(async () => {
    const mapToOptions = (data) =>
      data.map((item) => ({
        label: item.name || `ID ${item.id}`,
        value: item.id,
      }));

    try {
      const [engineers, architects, cas] = await Promise.all([
        databaseService.getAllEngineers(),
        databaseService.getAllArchitects(),
        databaseService.getAllCAs()
      ]);

      setEngineerOptions(mapToOptions(engineers));
      setArchitectOptions(mapToOptions(architects));
      setCAsOptions(mapToOptions(cas));
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  }, [setEngineerOptions, setArchitectOptions, setCAsOptions]);

  // Memoized props for each professional section
  const engineerProps = useMemo(() => ({
    roleLabel: 'Engineer',
    roleKey: 'engineer',
    roleKeyForId: 'engineer_id',
    roleData: engineerData,
    setRoleData: setEngineerData,
    handleSubmitRole: handleSubmitEngineer,
    roleOptions: engineerOptions,
    disabled,
    formData,
    setFormData,
    filePreviews,
    setFilePreviews,
    onRefreshOptions: refreshAllOptions
  }), [
    engineerData, setEngineerData, handleSubmitEngineer, engineerOptions,
    disabled, formData, setFormData, filePreviews, refreshAllOptions
  ]);

  const architectProps = useMemo(() => ({
    roleLabel: 'Architect',
    roleKey: 'architect',
    roleKeyForId: 'architect_id',
    roleData: architectData,
    setRoleData: setArchitectData,
    handleSubmitRole: handleSubmitArchitect,
    roleOptions: architectOptions,
    disabled,
    formData,
    setFormData,
    filePreviews,
    setFilePreviews,
    onRefreshOptions: refreshAllOptions
  }), [
    architectData, setArchitectData, handleSubmitArchitect, architectOptions,
    disabled, formData, setFormData, filePreviews, refreshAllOptions
  ]);

  const caProps = useMemo(() => ({
    roleLabel: 'CA',
    roleKey: 'ca',
    roleKeyForId: 'ca_id',
    roleData: caData,
    setRoleData: setCAData,
    handleSubmitRole: handleSubmitCA,
    roleOptions: casOptions,
    disabled,
    formData,
    setFormData,
    filePreviews,
    setFilePreviews,
    onRefreshOptions: refreshAllOptions
  }), [
    caData, setCAData, handleSubmitCA, casOptions,
    disabled, formData, setFormData, filePreviews, refreshAllOptions
  ]);

  if (!projectId) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="py-2 px-6 bg-[#5CAAAB] rounded-xl flex flex-row items-center shadow-lg justify-around">
        <h1 className="text-2xl font-bold text-white flex-1">{activeTab}</h1>
        {formData?.updated_by && <UpdateInfoComponent formData={formData} />}
      </div>

      <ProfessionalSection {...engineerProps} />
      <ProfessionalSection {...architectProps} />
      <ProfessionalSection {...caProps} />

      {!disabled && (
        <button
          type="submit"
          className="mt-6 bg-[#5caaab] shadow-lg border border-white/20 hover:bg-[#4a9899] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Save All
        </button>
      )}
    </form>
  );
}

export default React.memo(ProjectProfessionalDetailsForm);