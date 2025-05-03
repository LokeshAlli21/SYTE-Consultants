import React from 'react';

function AssignmentForm({ formData, setFormData, handleSubmitAssignment, activeTab = "Assignment Details" }) {

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

  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className=' bg-white rounded-xl'>
    <div className="py-2 px-6 bg-[#5CAAAB] rounded-t-xl ">
        <h1 className="text-2xl font-bold text-white">{activeTab}</h1>
      </div>

      <div className=" p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="flex flex-col">
          <label className="mb-2 font-medium">Assignment Type</label>
          <input
            type="text"
            name="assignment_type"
            value={formData.assignment_type}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={commonInputStyles}
            placeholder="e.g., Registration, Compliance"
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
