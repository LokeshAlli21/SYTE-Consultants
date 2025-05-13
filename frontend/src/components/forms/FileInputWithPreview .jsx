import React, { useRef, useState } from 'react';
import { FaFilePdf, FaImage } from 'react-icons/fa';

const FileInputWithPreview = ({ label, name, onChange, filePreview, onDelete, disabled=false, className }) => {
  const inputRef = useRef(null);
  const [fullScreenPreview, setFullScreenPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  // Handle drag over to highlight the drop area
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  // Handle when drag leaves the area
  const handleDragLeave = () => {
    setDragging(false);
  };

  // Handle file drop (set the file and pass it to parent via onChange)
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      // Simulate a real file input change event
      const mockEvent = {
        target: {
          name,
          files: [file],
        },
      };
      onChange(mockEvent);
    }
  };
  

  // Clear the file input field and notify the parent to delete the preview
  const handleDelete = () => {
    if (inputRef.current) {
      inputRef.current.value = ''; // Clear the input field
      setFileName('');
    }
    onDelete();
  };

  // Open full-screen preview of the file
  const handlePreviewClick = () => {
    setFullScreenPreview(typeof filePreview === 'object' ? filePreview.url : filePreview); // Set the selected file as the full-screen preview
  };

  // Close the full-screen preview modal
  const closeFullScreen = () => {
    setFullScreenPreview(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

       {disabled && !filePreview &&
      <h3 className='flex font-medium flex-col items-center justify-center bg-gray-50 text-[#ff0800]  border-gray-300 w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition' >Not exists</h3>
      }


      {!filePreview && !disabled &&
        <div
        className={`flex flex-col items-center justify-center w-full h-12 border-2 border-dashed rounded-lg cursor-pointer transition ${dragging ? 'border-[#5caaab] bg-gray-100' : 'border-gray-300 bg-gray-50'} ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <div className="flex flex-row items-center w-full justify-around p-4">
          {fileName ? (
            <p className="text-sm text-[#5caaab] font-semibold">{fileName}</p>
          ) : (
            <>
              <div className=" mb-1 w-10">
                <FaFilePdf className="text-[#5caaab] h-12 mx-auto" />
              </div>
              <div className='flex flex-row items-center w-full justify-center gap-2 '>
                <p className="mb-1 text-sm text-[#5caaab] font-semibold">Click or drag to upload</p>
              <p className="text-xs text-gray-500 mb-1">(Image or PDF)
                
                </p>
                {/* <span className="text-xs text-gray-500">
                (max 20MB)

                </span> */}
              </div>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          name={name}
          disabled={disabled}
          accept="image/*,application/pdf"
          onChange={onChange}
          className="hidden"
        />
      </div>
      }

{/* File Preview */}
{filePreview && (
  <div className="relative flex items-center justify-around">
    {(typeof filePreview === 'object' && filePreview?.type?.startsWith('image/')) ||
    (typeof filePreview === 'string' &&
      filePreview.match(/\.(jpeg|jpg|png|gif|webp|png)$/i)) ? (
      <img
        src={typeof filePreview === 'object' ? filePreview.url : filePreview}
        alt="Preview"
        className={`h-12 ${!className && 'w-auto'} rounded-md object-cover border shadow-sm cursor-pointer ${className}`}
        onClick={handlePreviewClick}
      />
    ) : (
      <div className="flex flex-col">
        <h2
          className="text-blue-600 underline text-sm cursor-pointer"
          onClick={handlePreviewClick}
        >
          View Uploaded File
        </h2>
      </div>
    )}
    {/* Delete button for file */}
    {!disabled  &&
    <button
      type="button"
      onClick={handleDelete}
      className="relative py-2 px-5 text-red-600 font-bold text-lg bg-transparent rounded-xl shadow-sm shadow-neutral-50 hover:bg-zinc-100 transition-all"
      title="Remove selected file"
    >
      Delete ❌
    </button>
    }
  </div>
)}

{/* Fullscreen Preview Modal */}
{fullScreenPreview && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="relative max-w-full max-h-full">
      {fullScreenPreview.match(/\.(jpeg|jpg|png|gif|webp|png)$/i) ? (
        <img
          src={fullScreenPreview}
          alt="Full Screen Preview"
          className="max-w-full h-[90vh] min-w-[50vw] object-contain"
        />
      ) : (
        <iframe
          src={fullScreenPreview}
          title="PDF Preview"
          className="w-full min-w-[80vw] min-h-[80vh] h-full border-none"
        ></iframe>
      )}

      <button
        onClick={closeFullScreen}
        title="Close Preview"
        className="absolute top-2 right-2 text-white hover:bg-purple-100 duration-300 shadow-md bg-black bg-opacity-50 p-2 rounded-full"
      >
        ❌
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default FileInputWithPreview;
