import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import databaseService from "../../backend-services/database/database";

const assignmentOptions = [
  { value: 'registration', label: 'Registration' },
  { value: 'extension', label: 'Extension' },
  { value: 'bank_account_change', label: 'Bank Account Change' },
  { value: 'correction', label: 'Correction' },
];

function AssignmentForm({ formData, setFormData, handleSubmitAssignment, activeTab = "Assignment Details" }) {

  const selectRef = useRef(null);

  const [projectsForDropdown, setProjectsForDropdown] = useState([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await databaseService.getAllProjectsForDropdown();
        console.log(data);
        setProjectsForDropdown(data);
      } catch (error) {
        toast.error("❌ Failed to load projects");
      } finally {
        // setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === "" ? "" : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // If the currently focused element is react-select and menu is not open
      if (document.activeElement === selectRef.current?.inputRef && !selectRef.current?.state?.menuIsOpen) {
        e.preventDefault(); // prevent accidental form submit
        return;
      }
  
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1]?.focus();
    }
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to submit?");
    if (confirmed) {
      handleSubmitAssignment();
    }
  };

  const handleAssignmentChange = (selectedOption, { action }) => {
    setFormData((prev) => ({
      ...prev,
      assignment_type: selectedOption ? selectedOption.value : '',
    }));
  
    // After selecting, move to the next focusable element (if not creating a new option)
    if (action === 'select-option') {
      setTimeout(() => {
        const activeElement = document.activeElement;
        const form = activeElement?.form;
        if (form) {
          const index = Array.prototype.indexOf.call(form, activeElement);
          form.elements[index + 1]?.focus();
        }
      }, 0);
    }
  };
  

  const selectedOption = assignmentOptions.find(
    (option) => option.value === formData.assignment_type
  );

  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className=' bg-white rounded-xl'>
    <div className="py-2 px-6 bg-[#5CAAAB] rounded-t-xl ">
        <h1 className="text-2xl font-bold text-white">{activeTab}</h1>
      </div>

      <div className=" p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

      <div className="flex flex-col w-full">
  <label className="mb-2 font-medium text-gray-700">Select Project *</label>
  <Select
    options={projectsForDropdown}
    value={projectsForDropdown.find(opt => opt.value === formData.project_id)}
    required={true}
    onChange={(selectedOption) => {
      setFormData((prev) => ({
        ...prev,
        project_id: selectedOption ? selectedOption.value : '',
      }));
    }}
    isSearchable={true}
    ref={selectRef}
    placeholder="Select a project"
    styles={{
      control: (base, state) => ({
        ...base,
        padding: "6px",
        borderRadius: "0.5rem",
        borderColor: state.isFocused ? "#5caaab" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 2px #5caaab66" : "none",
        "&:hover": {
          borderColor: "#5caaab",
        },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        zIndex: 20,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "#5caaab"
          : state.isFocused
          ? "#5caaab22"
          : "white",
        color: state.isSelected ? "white" : "black",
        padding: "10px 12px",
        cursor: "pointer",
      }),
    }}
  />
</div>


      <div className="flex flex-col w-full">
        <label className="mb-2 font-medium text-gray-700">Assignment Type</label>
        <Select
          options={assignmentOptions}
          value={selectedOption}
          onChange={handleAssignmentChange}
          isSearchable={true}
          ref={selectRef}
          placeholder="Select assignment type"
          styles={{
            control: (base, state) => ({
              ...base,
              padding: "6px",
              borderRadius: "0.5rem", // rounded-lg
              borderColor: state.isFocused ? "#5caaab" : "#d1d5db", // focus:border-[#5caaab] or border-gray-300
              boxShadow: state.isFocused ? "0 0 0 2px #5caaab66" : "none", // focus:ring
              "&:hover": {
                borderColor: "#5caaab",
              },
            }),
            menu: (base) => ({
              ...base,
              borderRadius: "0.5rem",
              zIndex: 20,
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? "#5caaab"
                : state.isFocused
                ? "#5caaab22"
                : "white",
              color: state.isSelected ? "white" : "black",
              padding: "10px 12px",
              cursor: "pointer",
            }),
          }}
        />
      </div>

        <div className="flex flex-col">
          <label className="mb-2 font-medium">Payment Date</label>
          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={commonInputStyles}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-medium">Application Number</label>
          <input
            type="text"
            name="application_number"
            value={formData.application_number}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={commonInputStyles}
          />
        </div>

        {[
          "consultation_charges",
          "govt_fees",
          "ca_fees",
          "engineer_fees",
          "arch_fees",
          "liasioning_fees"
        ].map(field => (
          <div className="flex flex-col" key={field}>
            <label className="mb-2 font-medium capitalize">{field.replace(/_/g, ' ')}</label>
            <input
              type="number"
              step="0.01"
              name={field}
              value={formData[field]}
              onChange={handleNumberChange}
              onKeyDown={handleKeyDown}
              className={commonInputStyles}
            />
          </div>
        ))}

        <div className="col-span-1 md:col-span-2 flex flex-col">
          <label className="mb-2 font-medium">Remarks</label>
          <textarea
            name="remarks"
            rows={4}
            value={formData.remarks}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={commonInputStyles}
          ></textarea>
        </div>
      </div>
</div>
      <button
        type="submit"
        className="w-fit self-end px-5 py-3 bg-[#5CAAAB] hover:bg-[#489496] text-lg text-white rounded-xl font-semibold shadow-xl transition"
      >
        Submit
      </button>
    </form>
  );
}

export default AssignmentForm;
