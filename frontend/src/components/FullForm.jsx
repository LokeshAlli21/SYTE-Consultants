import InputField from './InputField';
import DropdownField from './DropdownField';
import FileUploadField from './FileUploadField';

const FullForm = () => {
  return (
    <form className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto mt-10">
      <h2 className="text-xl font-semibold text-[#2F4C92] mb-6">Promoter Registration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Full Name" name="fullName" />
        <InputField label="Email Address" type="email" name="email" />
        <InputField label="Phone Number" type="tel" name="phone" />
        <DropdownField
          label="District"
          name="district"
          options={[
            { label: 'Select District', value: '' },
            { label: 'District A', value: 'a' },
            { label: 'District B', value: 'b' },
          ]}
        />
        <DropdownField
          label="City"
          name="city"
          options={[
            { label: 'Select City', value: '' },
            { label: 'City X', value: 'x' },
            { label: 'City Y', value: 'y' },
          ]}
        />
        <FileUploadField label="Upload ID Proof" name="idProof" />
        <FileUploadField label="Upload Photo" name="photo" />
      </div>

      <div className="mt-6 text-right">
        <button
          type="submit"
          className="bg-[#5CAAAB] text-white px-6 py-2 rounded-lg hover:bg-[#076666]"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default FullForm;
