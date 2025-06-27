import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import FileInputWithPreview from './FileInputWithPreview ';
import databaseService from '../../backend-services/database/database';
import UpdateInfoComponent from '../UpdateInfoComponent';

const PROJECT_TYPE_OPTIONS = [
  { label: "Residential / Group Housing", value: "Residential / Group Housing" },
  { label: "Commercial", value: "Commercial" },
  { label: "Mixed", value: "Mixed" },
  { label: "Plotted", value: "Plotted" },
];

const COMMON_INPUT_STYLES = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] transition-all duration-200";

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
    transition: "all 0.2s ease-in-out",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    zIndex: 20,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
    transition: "background-color 0.15s ease-in-out",
  }),
};

// Extract FormField as a separate memoized component
const FormField = React.memo(({ 
  label, 
  name, 
  type = "text", 
  required = false, 
  placeholder = "", 
  children,
  disabled,
  value,
  onChange,
  onKeyDown,
  error,
  ...props 
}) => (
  <div className="flex flex-col">
    <label className="mb-2 font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input
        disabled={disabled}
        type={type}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`${COMMON_INPUT_STYLES} ${error ? 'border-red-500' : ''}`}
        required={required}
        {...props}
      />
    )}
    {error && (
      <span className="text-red-500 text-sm mt-1">{error}</span>
    )}
  </div>
));

// Extract SelectField as a separate memoized component
const SelectField = React.memo(({ 
  label, 
  name, 
  options, 
  required = false, 
  placeholder = "",
  isLoading = false,
  disabled,
  value,
  onChange,
  error,
  selectRef,
  ...props 
}) => (
  <div className="flex flex-col w-full">
    <label className="mb-2 font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Select
      isDisabled={disabled}
      options={options}
      value={options.find(opt => opt.value === value) || null}
      onChange={onChange}
      isSearchable={true}
      isLoading={isLoading}
      placeholder={placeholder}
      ref={selectRef}
      styles={SELECT_STYLES}
      {...props}
    />
    {error && (
      <span className="text-red-500 text-sm mt-1">{error}</span>
    )}
  </div>
));

function ProjectDetailsForm({ 
  disabled = false, 
  activeTab = '', 
  formData = {}, 
  setFormData, 
  handleSubmitProjectDetails, 
  projectId 
}) {
  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState({
    promoters: false,
    channelPartners: false,
    locations: false,
  });
  const [errors, setErrors] = useState({});
  
  // Data states
  const [promotersForDropdown, setPromotersForDropdown] = useState([]);
  const [channelPartnersForDropdown, setChannelPartnersForDropdown] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [districtCityMap, setDistrictCityMap] = useState({});
  const [filePreviews, setFilePreviews] = useState({});

  // Refs
  const selectRef = useRef(null);
  const formRef = useRef(null);

  // Memoize validation function to prevent recreation
  const validateField = useCallback((name, value) => {
    const validationRules = {
      promoter_id: (val) => !val ? 'Promoter is required' : null,
      project_name: (val) => !val?.trim() ? 'Project name is required' : null,
      project_type: (val) => !val ? 'Project type is required' : null,
      project_pincode: (val) => {
        if (!val) return null;
        if (!/^\d{6}$/.test(val)) return 'Pincode must be exactly 6 digits';
        return null;
      },
      login_id: (val) => {
        if (!val) return null;
        if (val.length < 3) return 'Login ID must be at least 3 characters';
        return null;
      },
      password: (val) => {
        if (!val) return null;
        if (val.length < 6) return 'Password must be at least 6 characters';
        return null;  
      },
    };

    return validationRules[name]?.(value) || null;
  }, []);

  // Fetch data with error handling
  const fetchPromoters = useCallback(async () => {
    setLoading(prev => ({ ...prev, promoters: true }));
    try {
      const data = await databaseService.getAllPromotersForDropdown();
      setPromotersForDropdown(data || []);
    } catch (error) {
      console.error("Error fetching promoters:", error);
      toast.error("❌ Failed to load promoters");
    } finally {
      setLoading(prev => ({ ...prev, promoters: false }));
    }
  }, []);

  const fetchChannelPartners = useCallback(async () => {
    setLoading(prev => ({ ...prev, channelPartners: true }));
    try {
      const data = await databaseService.getAllChannelPartnersForDropdown();
      setChannelPartnersForDropdown(data || []);
    } catch (error) {
      console.error("Error fetching channel partners:", error);
      toast.error("❌ Failed to load Channel Partners");
    } finally {
      setLoading(prev => ({ ...prev, channelPartners: false }));
    }
  }, []);

  const fetchCitiesAndDistricts = useCallback(async () => {
    setLoading(prev => ({ ...prev, locations: true }));
    try {
      const { districtOptions = [], districtCityMap = {} } = 
        await databaseService.getAllCitiesAndDistricts();
      setDistrictCityMap(districtCityMap);
      setDistrictOptions(districtOptions);
    } catch (error) {
      console.error("Error fetching cities and districts:", error);
      toast.error("❌ Failed to load locations");
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchPromoters();
    fetchChannelPartners();
    fetchCitiesAndDistricts();
  }, [fetchPromoters, fetchChannelPartners, fetchCitiesAndDistricts]);

  // Update city options when district changes
  useEffect(() => {
    if (formData.district && districtCityMap[formData.district]) {
      setCityOptions(districtCityMap[formData.district]);
      // Clear city if it's not valid for the new district
      if (formData.city && !districtCityMap[formData.district].some(city => city.value === formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setCityOptions([]);
    }
  }, [formData.district, districtCityMap, formData.city, setFormData]);

  // Initialize file previews for existing uploaded files
  useEffect(() => {
    const uploadedUrls = {};
    Object.entries(formData || {}).forEach(([key, value]) => {
      if (
        typeof key === "string" &&
        key.endsWith("_uploaded_url") &&
        typeof value === "string" &&
        value.startsWith("http")
      ) {
        uploadedUrls[key] = { url: value, type: 'application/pdf' };
      }
    });

    if (Object.keys(uploadedUrls).length > 0) {
      setFilePreviews(uploadedUrls);
    }
  }, [formData]);

  // Memoize all event handlers to prevent recreation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });

    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for certain fields
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [setFormData, validateField]);

  const handleSelectChange = useCallback((name) => (selectedOption) => {
    const value = selectedOption ? selectedOption.value : '';
    
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });

    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [setFormData, validateField]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      // Handle react-select specifically
      if (document.activeElement === selectRef.current?.inputRef && 
          !selectRef.current?.state?.menuIsOpen) {
        e.preventDefault();
        return;
      }

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

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, and PDF files are allowed");
        return;
      }

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
  }, [setFormData]);

  const handleFileDelete = useCallback((name) => {
    setFormData(prev => ({ ...prev, [name]: null }));
    setFilePreviews(prev => {
      const updatedPreviews = { ...prev };
      delete updatedPreviews[name];
      return updatedPreviews;
    });
  }, [setFormData]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const requiredFields = ['promoter_id', 'project_name', 'project_type'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Additional validations
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    const confirmed = window.confirm('Are you sure you want to submit?');
    if (!confirmed) {
      return; // User cancelled
    }

    try {
      // handleSubmitProjectDetails returns true/false based on success
      const success = await handleSubmitProjectDetails();
      
      if (success) {
        // Don't show toast here - it's already handled in the parent component
        // The parent component will also handle tab navigation
        console.log("Project details submitted successfully");
      } else {
        // This handles validation failures or other issues
        toast.error("Failed to save project details");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to save project details");
    }
  }, [validateForm, handleSubmitProjectDetails]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Memoize handlers for specific select fields
  const handleChannelPartnerChange = useMemo(() => handleSelectChange('channel_partner_id'), [handleSelectChange]);
  const handlePromoterChange = useMemo(() => handleSelectChange('promoter_id'), [handleSelectChange]);
  const handleProjectTypeChange = useMemo(() => handleSelectChange('project_type'), [handleSelectChange]);
  const handleDistrictChange = useMemo(() => handleSelectChange('district'), [handleSelectChange]);
  const handleCityChange = useMemo(() => handleSelectChange('city'), [handleSelectChange]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className='flex flex-col gap-4 bg-white p-0 rounded-2xl shadow-lg border border-white/20'>
        <div className='py-2 px-6 relative rounded-t-2xl bg-[#5CAAAB] flex flex-row items-center justify-around'>
          <h1 className='text-2xl font-bold text-white flex-1'>{activeTab}</h1>
          {formData?.updated_by && <UpdateInfoComponent formData={formData} />}
        </div>
        
        <div className='p-6 pt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
          <SelectField
            label="Select Channel Partner"
            name="channel_partner_id"
            options={channelPartnersForDropdown}
            placeholder="Select a Channel Partner"
            isLoading={loading.channelPartners}
            disabled={disabled}
            value={formData.channel_partner_id}
            onChange={handleChannelPartnerChange}
            error={errors.channel_partner_id}
          />

          <SelectField
            label="Select Promoter"
            name="promoter_id"
            options={promotersForDropdown}
            placeholder="Select a promoter"
            required={true}
            isLoading={loading.promoters}
            disabled={disabled}
            value={formData.promoter_id}
            onChange={handlePromoterChange}
            error={errors.promoter_id}
          />

          <FormField
            label="Project Name"
            name="project_name"
            placeholder="Enter Project name"
            required={true}
            disabled={disabled}
            value={formData.project_name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={errors.project_name}
          />

          <SelectField
            label="Select Project Type"
            name="project_type"
            options={PROJECT_TYPE_OPTIONS}
            placeholder="Select Project Type"
            required={true}
            disabled={disabled}
            value={formData.project_type}
            onChange={handleProjectTypeChange}
            error={errors.project_type}
          />

          <FormField
            label="RERA Number"
            name="rera_number"
            placeholder="Enter RERA number"
            disabled={disabled}
            value={formData.rera_number}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={errors.rera_number}
          />

          <FileInputWithPreview
            disabled={disabled}
            label="RERA Certificate"
            name="rera_certificate_uploaded_url"
            onChange={handleFileChange}
            filePreview={filePreviews.rera_certificate_uploaded_url}
            onDelete={() => handleFileDelete("rera_certificate_uploaded_url")}
          />

          <FormField
            label="Login ID"
            name="login_id"
            placeholder="Enter Login ID"
            disabled={disabled}
            value={formData.login_id}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={errors.login_id}
          />

          <div className="flex flex-col relative">
            <label className="mb-2 font-medium text-gray-700">
              Password
            </label>
            <input
              disabled={disabled}
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`${COMMON_INPUT_STYLES} pr-16 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Enter Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-11 text-sm font-medium text-[#5caaab] hover:text-[#489496] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {errors.password && (
              <span className="text-red-500 text-sm mt-1">{errors.password}</span>
            )}
          </div>

          <SelectField
            label="Select District"
            name="district"
            options={districtOptions}
            placeholder="Select a district"
            isLoading={loading.locations}
            disabled={disabled}
            value={formData.district}
            onChange={handleDistrictChange}
            error={errors.district}
          />

          <SelectField
            label="Select City"
            name="city"
            options={cityOptions}
            placeholder="Select a city"
            isDisabled={!formData.district || disabled}
            disabled={disabled}
            value={formData.city}
            onChange={handleCityChange}
            error={errors.city}
          />

          <FormField
            label="Project Pincode"
            name="project_pincode"
            type="number"
            placeholder="Enter 6-digit pincode"
            onWheel={(e) => e.target.blur()}
            maxLength={6}
            minLength={6}
            className={`${COMMON_INPUT_STYLES} appearance-none 
              [&::-webkit-inner-spin-button]:appearance-none 
              [&::-webkit-outer-spin-button]:appearance-none 
              [-moz-appearance:textfield]`}
            disabled={disabled}
            value={formData.project_pincode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={errors.project_pincode}
          />

          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Project Address</label>
            <textarea
              disabled={disabled}
              name="project_address"
              value={formData.project_address || ''}
              onChange={handleChange}
              rows={3}
              className={COMMON_INPUT_STYLES}
              placeholder="Enter project address"
            />
          </div>

          <FormField
            label="Registration Date"
            name="registration_date"
            type="date"
            disabled={disabled}
            value={formData.registration_date}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={errors.registration_date}
          />

          <FormField
            label="Expiry Date"
            name="expiry_date"
            type="date"
            min={formData.registration_date}
            disabled={disabled}
            value={formData.expiry_date}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={errors.expiry_date}
          />
        </div>
      </div>
      
      {!disabled && (
        <button
          type="submit"
          disabled={Object.keys(errors).length > 0}
          className="w-fit px-5 shadow-xl border border-white/20 m-0 bg-[#5CAAAB] hover:bg-[#489496] disabled:bg-gray-400 disabled:cursor-not-allowed text-lg text-white py-3 rounded-xl self-end font-semibold transition-all duration-200"
        >
          Save Project Details
        </button>
      )}
    </form>
  );
}

export default React.memo(ProjectDetailsForm);