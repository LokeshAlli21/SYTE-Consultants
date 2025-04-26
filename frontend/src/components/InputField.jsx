const InputField = ({ label, type = 'text', name, placeholder }) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CAAAB]"
      />
    </div>
  );
  
  export default InputField;
  