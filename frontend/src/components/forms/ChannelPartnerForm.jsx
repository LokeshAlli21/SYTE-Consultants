import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

import databaseService from '../../backend-services/database/database';
import UpdateInfoComponent from '../UpdateInfoComponent';
import FileInputWithPreview from './FileInputWithPreview ';

// Constants
const COMMON_INPUT_STYLES = 
  "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] disabled:bg-gray-100 disabled:cursor-not-allowed";

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
    opacity: state.isDisabled ? 0.6 : 1,
    cursor: state.isDisabled ? "not-allowed" : "default",
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

/**
 * ChannelPartnerForm Component
 * Reusable form component for channel partner data
 */
function ChannelPartnerForm({
  disabled = false,
  formData,
  setFormData,
  onSubmit,
  isSubmitting = false,
  activeTab = "Channel Partner Details"
}) {
  // Refs
  const districtSelectRef = useRef(null);
  const citySelectRef = useRef(null);

  // State
  const [locationData, setLocationData] = useState({
    districts: [],
    cities: [],
    districtCityMap: {}
  });
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const [filePreviews, setFilePreviews] = useState({
    cp_photo_uploaded_url: formData?.cp_photo_uploaded_url || null,
  });     

  /**
   * Handles input field changes
   */
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, [setFormData]);

  /**
   * Handles district selection change
   */
  const handleDistrictChange = useCallback((selectedOption) => {
    setFormData(prevData => ({
      ...prevData,
      district: selectedOption ? selectedOption.value : '',
      city: '' // Reset city when district changes
    }));
  }, [setFormData]);

  /**
   * Handles city selection change
   */
  const handleCityChange = useCallback((selectedOption) => {
    setFormData(prevData => ({
      ...prevData,
      city: selectedOption ? selectedOption.value : ''
    }));
  }, [setFormData]);

  /**
   * Handles keyboard navigation in form
   */
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      // Prevent form submission on Enter for select elements
      const isSelectElement = event.target.closest('.react-select__control');
      if (isSelectElement) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      const form = event.target.form;
      const formElements = Array.from(form.elements);
      const currentIndex = formElements.indexOf(event.target);
      
      // Focus next form element
      const nextElement = formElements[currentIndex + 1];
      if (nextElement && nextElement.focus) {
        nextElement.focus();
      }
    }
  }, []);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    // Basic validation
    if (!formData.full_name?.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    // Confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to submit?");
    if (isConfirmed && onSubmit) {
      onSubmit();
    }
  }, [formData.full_name, onSubmit]);

  /**
   * Fetches location data (districts and cities)
   */
  const fetchLocationData = useCallback(async () => {
    setIsLoadingLocations(true);
    try {
      const { districtOptions, districtCityMap } = 
        await databaseService.getAllCitiesAndDistricts();
      
      setLocationData({
        districts: districtOptions || [],
        cities: [],
        districtCityMap: districtCityMap || {}
      });
    } catch (error) {
      console.error("Error fetching location data:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoadingLocations(false);
    }
  }, []);

  // Memoized values
  const selectedDistrict = useMemo(() => 
    locationData.districts.find(option => option.value === formData.district),
    [locationData.districts, formData.district]
  );

  const availableCities = useMemo(() => 
    formData.district ? locationData.districtCityMap[formData.district] || [] : [],
    [formData.district, locationData.districtCityMap]
  );

  const selectedCity = useMemo(() => 
    availableCities.find(option => option.value === formData.city),
    [availableCities, formData.city]
  );

  // Effects
  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  // Form fields configuration
  const formFields = [
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true
    },
    {
      name: "contact_number",
      label: "Contact Number",
      type: "tel",
      placeholder: "Primary contact number"
    },
    {
      name: "alternate_contact_number",
      label: "Alternate Contact Number",
      type: "tel",
      placeholder: "Secondary contact number"
    },
    {
      name: "email_id",
      label: "Email ID",
      type: "email",
      placeholder: "e.g. abc@xyz.com"
    }
  ];

    const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [name]: { url: reader.result, type: file.type },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

    const handleFileDelete = (name) => {
    setFormData((prev) => ({ ...prev, [name]: null }));

    setFilePreviews((prev) => {
      const updatedPreviews = { ...prev };
      delete updatedPreviews[name];
      return updatedPreviews;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Form Header */}
        <div className="py-2 px-6 bg-[#5CAAAB] rounded-t-xl flex flex-row items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex-1">{activeTab}</h2>
          {formData.updated_by && (
            <UpdateInfoComponent formData={formData} />
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          <FileInputWithPreview
              label="Upload Photo"
              name="cp_photo_uploaded_url"
              onChange={handleFileChange}
              disabled={disabled}
              className={' w-[150px] h-[150px]'}
              filePreview={filePreviews.cp_photo_uploaded_url}
              onDelete={() => handleFileDelete("cp_photo_uploaded_url")}
            />
            
          {/* Text Input Fields */}
          {formFields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                required={field.required}
                className={COMMON_INPUT_STYLES}
                placeholder={field.placeholder}
                autoComplete="off"
              />
            </div>
          ))}

          {/* District Select */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Select District
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Select
              ref={districtSelectRef}
              options={locationData.districts}
              value={selectedDistrict || null}
              onChange={handleDistrictChange}
              isDisabled={disabled || isLoadingLocations}
              isLoading={isLoadingLocations}
              isSearchable={true}
              placeholder={isLoadingLocations ? "Loading districts..." : "Select a district"}
              styles={SELECT_STYLES}
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
            />
          </div>

          {/* City Select */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Select City
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Select
              ref={citySelectRef}
              options={availableCities}
              value={selectedCity || null}
              onChange={handleCityChange}
              isDisabled={disabled || !formData.district || availableCities.length === 0}
              isSearchable={true}
              placeholder={
                !formData.district 
                  ? "Select district first" 
                  : availableCities.length === 0 
                    ? "No cities available" 
                    : "Select a city"
              }
              styles={SELECT_STYLES}
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {!disabled && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit self-end px-6 py-3 bg-[#5CAAAB] hover:bg-[#489496] disabled:bg-gray-400 disabled:cursor-not-allowed text-lg text-white rounded-xl font-semibold shadow-xl transition-colors duration-200 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      )}
    </form>
  );
}

// PropTypes for type checking
ChannelPartnerForm.propTypes = {
  disabled: PropTypes.bool,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  activeTab: PropTypes.string
};

export default ChannelPartnerForm;