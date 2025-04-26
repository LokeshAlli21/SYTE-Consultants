import React, { useState } from 'react';

const FileInputWithPreview = ({ label, name, onChange, filePreview }) => {
    return (
      <div className="flex flex-col">
        <label className="mb-2 font-medium">{label}</label>
        <input
          type="file"
          name={name}
          accept="image/*,application/pdf"
          onChange={onChange}
          className="file-input file-input-bordered file-input-md w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#5CAAAB] transition bg-white text-gray-600"
        />
        {filePreview && (
          <div className="mt-3">
            {filePreview.type.startsWith('image/') ? (
              <img src={filePreview.url} alt="Preview" className="h-32 rounded-md object-cover border" />
            ) : (
              <a
                href={filePreview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View Uploaded File
              </a>
            )}
          </div>
        )}
      </div>
    );
  };  

export default FileInputWithPreview;
