import React, { useState } from 'react'
import FileInputWithPreview from '../FileInputWithPreview ';

function HinduUndividedFamily({ 
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
    <div className="flex flex-col">
      <label className="mb-2 font-medium">HUF Name</label>
      <input
        type="text"
        name="huf_name"
        value={formData.huf_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 font-medium">Karta First Name</label>
      <input
        type="text"
        name="karta_first_name"
        value={formData.karta_first_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 font-medium">Karta Middle Name</label>
      <input
        type="text"
        name="karta_middle_name"
        value={formData.karta_middle_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 font-medium">Karta Last Name</label>
      <input
        type="text"
        name="karta_last_name"
        value={formData.karta_last_name}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 font-medium">Karta PAN Card</label>
      <input
        type="text"
        name="karta_pan_card"
        value={formData.karta_pan_card}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
        maxLength={10}
        minLength={10}
      />
    </div>

    <FileInputWithPreview
      label="Upload Karta PAN"
      name="karta_pan_uploaded_url"
      onChange={handleFileChange}
      disabled={disabled}
      filePreview={filePreviews.karta_pan_uploaded_url}
      onDelete={() => handleFileDelete("karta_pan_uploaded_url")}
    />

    <div className="flex flex-col">
      <label className="mb-2 font-medium">HUF PAN Card</label>
      <input
        type="text"
        name="huf_pan_card"
        value={formData.huf_pan_card}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
        maxLength={10}
        minLength={10}
      />
    </div>

    <FileInputWithPreview
      label="Upload HUF PAN"
      name="huf_pan_pan_uploaded_url"
      onChange={handleFileChange}
      disabled={disabled}
      filePreview={filePreviews.huf_pan_pan_uploaded_url}
      onDelete={() => handleFileDelete("huf_pan_pan_uploaded_url")}
    />

    <div className="flex flex-col">
      <label className="mb-2 font-medium">HUF GSTIN Number</label>
      <input
        type="text"
        name="huf_gstin_number"
        value={formData.huf_gstin_number}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={commonInputClass}
        maxLength={15}
      />
    </div>
  </>
);

}

export default HinduUndividedFamily