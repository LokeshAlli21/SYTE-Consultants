import React, { useRef, useState } from 'react';

const FileInputWithPreview = ({ label, name, onChange, filePreview, onDelete }) => {
  const inputRef = useRef(null);
  const [fullScreenPreview, setFullScreenPreview] = useState(null);

  const handleDelete = () => {
    if (inputRef.current) {
      inputRef.current.value = ''; // Clear the input field
    }
    onDelete();
  };

  const handlePreviewClick = () => {
    setFullScreenPreview(filePreview.url); // Set the selected file as the full screen preview
  };

  const closeFullScreen = () => {
    setFullScreenPreview(null); // Close the full-screen view
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-gray-700">{label}</label>

      <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*,application/pdf"
          onChange={onChange}
          className="file-input w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5CAAAB] transition bg-white text-gray-600"
        />

      <div className="relative flex items-center justify-around">

      {filePreview && (
        <div className="mt-3 relative">
          {filePreview.type.startsWith('image/') ? (
            <img
              src={filePreview.url}
              alt="Preview"
              className="h-32 w-auto rounded-md object-cover border shadow-sm cursor-pointer"
              onClick={handlePreviewClick}
            />
          ) : (
            <div className="flex flex-col">
              <h2 href={filePreview.url}
                className="text-blue-600 underline text-sm cursor-pointer"
                onClick={handlePreviewClick}>
                View Uploaded File
              </h2>
            </div>
          )}
        </div>
      )}

        {filePreview && (
          <button
            type="button"
            onClick={handleDelete}
            className=" relative py-1 px-2 text-red-600 font-bold text-lg bg-transparent rounded-xl shadow-xl shadow-neutral-50 hover:bg-zinc-100 transition-all"
            title="Remove selected file"
          >
            Delete ❌
          </button>
        )}
      </div>

      

      {/* Fullscreen Preview Modal */}
      {fullScreenPreview && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative max-w-full max-h-full">
            {filePreview.type.startsWith('image/') ? (
              <img
                src={fullScreenPreview}
                alt="Full Screen Preview"
                className="max-w-full max-h-full min-w-[50vw] min-h-[50vh] object-contain"
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
              // className="absolute top-[-25px] right-[-25px] text-blue text-xl bg-black p-2 rounded-full hover:bg-gray-500"
              title="Close Preview"
              className="absolute top-2 right-2 text-white hover:bg-purple-100 duration-300 shadow-md bg-black  bg-opacity-50 p-2 rounded-full"
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
