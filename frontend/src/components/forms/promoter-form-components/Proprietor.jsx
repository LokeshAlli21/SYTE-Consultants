import React, { useState } from 'react'
import FileInputWithPreview from '../FileInputWithPreview ';

function Proprietor({ 
  formData, 
  disabled, 
  commonInputClass, 
  setFormData 
}) {
  const [filePreviews, setFilePreviews] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // If the currently focused element is react-select and menu is not open
      if (
        document.activeElement === selectRef.current?.inputRef &&
        !selectRef.current?.state?.menuIsOpen
      ) {
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
  <>
  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
    <div className="flex flex-col">
      <label className="mb-2 font-medium">First Name</label>
      <input
        type="text"
        name="proprietor_first_name"
        value={formData.proprietor_first_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 font-medium">Middle Name</label>
      <input
        type="text"
        name="proprietor_middle_name"
        value={formData.proprietor_middle_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 font-medium">Last Name</label>
      <input
        type="text"
        name="proprietor_last_name"
        value={formData.proprietor_last_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>
</div>

    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
<div className="flex flex-col">
      <label className="mb-2 font-medium">Concern Name</label>
      <input
        type="text"
        name="proprietor_concern_name"
        value={formData.proprietor_concern_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>
        <div className="flex flex-col">
      <label className="mb-2 font-medium">Father's Full Name</label>
      <input
        type="text"
        name="proprietor_father_full_name"
        value={formData.proprietor_father_full_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>
    </div>

<div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
  
    <div className="flex flex-col">
      <label className="mb-2 font-medium">PAN Number</label>
      <input
        type="text"
        name="proprietor_pan_number"
        value={formData.proprietor_pan_number}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
        maxLength={10}
        minLength={10}
      />
    </div>

    <FileInputWithPreview
      label="Upload PAN Document"
      name="pan_uploaded_url"
      onChange={handleFileChange}
      disabled={disabled}
      filePreview={filePreviews.pan_uploaded_url}
      onDelete={() => handleFileDelete("pan_uploaded_url")}
    />

<div className="flex flex-col">
      <label className="mb-2 font-medium">GSTIN Number</label>
      <input
        type="text"
        name="proprietor_gstin_number"
        value={formData.proprietor_gstin_number}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
        maxLength={15}
      />
    </div>


    </div>

      <div className="flex flex-col w-full bg-[#598c8c13]  rounded-xl py-4 px-6 ">
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Disclosure of Interest
          </label>
          <p className="text-sm text-gray-600">
            Are you a Director/Designated Partner/Partner/Proprietor of any real
            estate project registered with RERA?
          </p>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="individual_disclosure_of_interest"
              name="individual_disclosure_of_interest"
              checked={formData.individual_disclosure_of_interest}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  individual_disclosure_of_interest: e.target.checked,
                }))
              }
              disabled={disabled}
              className="h-6 w-6 rounded border-gray-300 text-primary accent-[#5CAAAB] focus:ring-primary"
            />
            <label
              htmlFor="individual_disclosure_of_interest"
              className="text-sm text-gray-700"
            >
              Yes
            </label>
          </div>
        </div>
      </div>
  </>
);

}

export default Proprietor