import React, { useState } from 'react';
import FileInputWithPreview from './FileInputWithPreview ';

function ProjectDocumentForm({
  activeTab = '',
  formData,
  setFormData,
  handleSubmitProjectDocuments,
}) {
  const [filePreviews, setFilePreviews] = useState({});

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({
          ...prev,
          [name]: { url: reader.result, type: file.type },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDelete = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: null,
    }));

    setFilePreviews(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to submit?');
    if (confirmed) {
      handleSubmitProjectDocuments();
    }
  };

  const documentFields = [
    { name: 'cc_uploaded_url', label: 'Completion Certificate' },
    { name: 'plan_uploaded_url', label: 'Project Plan' },
    { name: 'search_report_uploaded_url', label: 'Search Report' },
    { name: 'da_uploaded_url', label: 'Development Agreement' },
    { name: 'pa_uploaded_url', label: 'Power of Attorney' },
    { name: 'satbara_uploaded_url', label: '7/12 Extract' },
    { name: 'promoter_letter_head_uploaded_url', label: "Promoter's Letterhead" },
    { name: 'promoter_sign_stamp_uploaded_url', label: "Promoter's Sign & Stamp" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-white p-0 rounded-xl shadow-md">
        <div className="py-2 px-6 bg-[#5CAAAB] rounded-t-xl">
          <h1 className="text-2xl font-bold text-white">Upload {activeTab}</h1>
        </div>

<div className=' p-6'>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {documentFields.map(({ name, label }) => (
            <FileInputWithPreview
              key={name}
              label={label}
              name={name}
              onChange={handleFileChange}
              filePreview={filePreviews[name]}
              onDelete={() => handleFileDelete(name)}
            />
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-[#5CAAAB] hover:bg-[#489496] text-white text-lg font-semibold rounded-xl shadow-lg transition"
          >
            Submit
          </button>
        </div>
</div>
      </div>
    </form>
  );
}

export default ProjectDocumentForm;
