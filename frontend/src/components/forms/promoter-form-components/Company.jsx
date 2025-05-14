import React, { useEffect, useState } from 'react'
import FileInputWithPreview from '../FileInputWithPreview ';

function Company({ 
  formData, 
  disabled, 
  commonInputClass, 
  setFormData 
}) {
  const [filePreviews, setFilePreviews] = useState({});

  useEffect(() => {
    const fetchPromoterData = async () => {
      const uploadedUrls = {};

      Object.entries(formData || {}).forEach(([key, value]) => {
        if (
          typeof key === "string" &&
          key.endsWith("_uploaded_url") &&
          typeof value === "string" &&
          value.startsWith("http")
        ) {
          uploadedUrls[key] = value;
        }
      });

      // console.log("✅ Uploaded URLs:", uploadedUrls);

      if (Object.keys(uploadedUrls).length > 0) {
        setFilePreviews(uploadedUrls);
      }
    };

    fetchPromoterData();
  }, []);
  
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
  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
    <div className="flex flex-col">
      <label className="mb-2 font-medium">Company Name</label>
      <input
        type="text"
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 font-medium">CIN Number</label>
      <input
        type="text"
        name="company_cin_number"
        value={formData.company_cin_number}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 font-medium">Company PAN Number</label>
      <input
        type="text"
        name="company_pan_number"
        value={formData.company_pan_number}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
        maxLength={10}
        minLength={10}
      />
    </div>

    <FileInputWithPreview
      label="Upload Company PAN Document"
      name="company_pan_uploaded_url"
      onChange={handleFileChange}
      disabled={disabled}
      filePreview={filePreviews.company_pan_uploaded_url}
      onDelete={() => handleFileDelete("company_pan_uploaded_url")}
    />

    <div className="flex flex-col">
      <label className="mb-2 font-medium">Incorporation Number</label>
      <input
        type="text"
        name="company_incorporation_number"
        value={formData.company_incorporation_number}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <FileInputWithPreview
      label="Upload Incorporation Document"
      name="company_incorporation_uploaded_url"
      onChange={handleFileChange}
      disabled={disabled}
      filePreview={filePreviews.company_incorporation_uploaded_url}
      onDelete={() => handleFileDelete("company_incorporation_uploaded_url")}
    />
     <div className="flex flex-col">
      <label className="mb-2 font-medium">GSTIN Number</label>
      <input
        type="text"
        name="company_gstin_number"
        value={formData.company_gstin_number}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
        maxLength={15}
      />
    </div>
    
  </div>
);


}

export default Company