const FileUploadField = ({ label, name }) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="file"
        name={name}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none"
      />
    </div>
  );
  
  export default FileUploadField;
  