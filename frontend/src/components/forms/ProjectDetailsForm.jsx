import React, { useState } from 'react'
import FileInputWithPreview from './FileInputWithPreview ';

function ProjectDetailsForm({ activeTab = '', formData, setFormData , handleSubmitProjectDetails}) {

    const [filePreviews, setFilePreviews] = useState({});
    

    
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
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
      };
      
     const handleFileDelete = (name) => {
      setFormData(prev => ({ ...prev, [name]: null }));
    
      setFilePreviews(prev => {
        const updatedPreviews = { ...prev };
        delete updatedPreviews[name];
        return updatedPreviews;
      });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleSubmitProjectDetails()
      };

    const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  return (
    <form
    onSubmit={handleSubmit}
     className="flex flex-col gap-4 ">
        <div className='flex flex-col gap-4 bg-white p-0 rounded-2xl shadow-md'>
        <div className='py-2 px-6 relative rounded-t-2xl bg-[#4a9899]'>
          <h1 className='text-2xl font-bold text-white'>{activeTab}</h1>
        </div>
        <div className='p-6 pt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'> 



<div className="flex flex-col">
  <label className="mb-2 font-medium">Channel Partner</label>
  <input
    type="text"
    name="channel_partner"
    value={formData.channel_partner}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>

{/* <div className="flex flex-col">
  <label className="mb-2 font-medium">Promoter ID</label>
  <input
    type="number"
    name="promoter_id"
    value={formData.promoter_id}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div> */}

<div className="flex flex-col">
  <label className="mb-2 font-medium">Select Promoter</label>
  <input
    type="text"
    name="promoter_name"
    value={formData.promoter_name}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Project Name *</label>
  <input
    type="text"
    name="project_name"
    required
    value={formData.project_name}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Project Type</label>
  <input
    type="text"
    name="project_type"
    value={formData.project_type}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
  />
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Project Address</label>
  <textarea
    name="project_address"
    value={formData.project_address}
    onChange={handleChange}
    rows={3}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Project Pincode</label>
  <input
    type='number'
    name="project_pincode"
    value={formData.project_pincode}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Login ID</label>
  <input
    type="text"
    name="login_id"
    value={formData.login_id}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Password</label>
  <input
    type="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">District</label>
  <input
    type="text"
    name="district"
    value={formData.district}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">City</label>
  <input
    type="text"
    name="city"
    value={formData.city}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">RERA Number</label>
  <input
    type="text"
    name="rera_number"
    value={formData.rera_number}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<FileInputWithPreview
  label="RERA Certificate"
  name="rera_certificate_uploaded_url"
  onChange={handleFileChange}
  filePreview={filePreviews.rera_certificate_uploaded_url}
  onDelete={() => handleFileDelete("rera_certificate_uploaded_url")}
/>


<div className="flex flex-col">
  <label className="mb-2 font-medium">Registration Date</label>
  <input
    type="date"
    name="registration_date"
    value={formData.registration_date}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>

<div className="flex flex-col">
  <label className="mb-2 font-medium">Expiry Date</label>
  <input
    type="date"
    name="expiry_date"
    value={formData.expiry_date}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    className={commonInputStyles}
/>
</div>





        </div>
        </div>
        <button
        type="submit"
        className="w-fit px-5 m-0 bg-[#5CAAAB] hover:bg-[#489496] text-lg shadow-xl text-white py-3 rounded-xl self-end font-semibold transition"
      >
        Submit
      </button>
        </form>
  )
}

export default ProjectDetailsForm