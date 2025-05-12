import React from 'react'

function Individual() {
  return (
          <>
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Aadhar Number</label>
              <input
                type='number'
                name="aadhar_number"
                value={formData.aadhar_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
                maxLength={12}
                minLength={12}
                pattern="\d{12}"
              />
            </div>


  
            <FileInputWithPreview
              label="Upload Aadhar Document"
              name="aadhar_uploaded_url"
              onChange={handleFileChange}
disabled={disabled}
              filePreview={filePreviews.aadhar_uploaded_url}
              onDelete={() => handleFileDelete("aadhar_uploaded_url")}
            />
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
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
              <label className="mb-2 font-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
                pattern="\d{10}"
                maxLength={10}
                minLength={10}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Email ID</label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
disabled={disabled}
                onKeyDown={handleKeyDown}
                className={commonInputClass}
              />
            </div>
          </>
        );
}

export default Individual