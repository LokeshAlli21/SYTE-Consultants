import React, { useEffect, useRef, useState } from 'react';

function ProjectProgressForm({
  projectBuildingProgress,
  projectCommonAreasProgress,
  setProjectBuildingProgress,
  setProjectCommonAreasProgress,
  handleSubmitProjectBuildingProgress,
  handleSubmitProjectCommonAreasProgresss,
}) {
  const [step, setStep] = useState(1);

  const [focusedField, setFocusedField] = useState({ key: null, name: null });
const inputRefs = useRef({});


  const handleBuildingChange = (e) => {
    const { name, value } = e.target;

    setProjectBuildingProgress(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleCommonAreaChange = (e, key) => {
    const { name, value, type, checked } = e.target;
  
    setFocusedField({ key, name }); // Track current input
  
    setProjectCommonAreasProgress(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [name]: type === 'checkbox' ? checked : name === 'percentage_of_work' ? Number(value) : value
      }
    }));
  };
  useEffect(() => {
    if (focusedField.key && focusedField.name) {
      const ref = inputRefs.current[`${focusedField.key}-${focusedField.name}`];
      if (ref) ref.focus();
    }
  }, [projectCommonAreasProgress, projectBuildingProgress]);
    

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1]?.focus();
    }
  };

  const handleSubmitBuilding = (e) => {
    e.preventDefault();
    const confirm = window.confirm("Submit Building Progress?");
    if (!confirm) return;
    handleSubmitProjectBuildingProgress();
    setStep(2);
  };

  const handleSubmitCommonAreas = (e) => {
    e.preventDefault();
    const confirm = window.confirm("Submit Common Area Progress?");
    if (!confirm) return;
    handleSubmitProjectCommonAreasProgresss();
  };

  const inputStyles = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";
  const sectionBox = "bg-white p-6 rounded-xl shadow-md";

  const ProgressBar = () => {
    // Define the steps
    const steps = [
      { id: 1, title: "Building Progress" },
      { id: 2, title: "Common Areas" }
    ];
  
    return (
      <div className="relative flex items-center justify-center w-full  mx-auto px-4 mb-4">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-0 w-full h-2 bg-gray-200 rounded-full z-0" />
  
        {/* Animated Progress Bar */}
        <div
          className="absolute top-5 left-0 h-2 bg-[#5caaab] rounded-full z-0 transition-all duration-300"
          style={{
            // Fill 50% for step 1 and 100% for step 2
            width: `${step === 1 ? 50 : step === 2 ? 100 : 0}%`,
          }}
        />
  
        {/* Steps */}
        {steps.map((item, idx) => {
          const isActive = step >= item.id;
  
          return (
            <div
              key={item.id}
              className="relative z-10 flex flex-col items-center flex-1 cursor-pointer group"
              onClick={() => setStep(item.id)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition duration-300
                  ${isActive ? "bg-[#5caaab] shadow-lg" : "bg-gray-300 group-hover:bg-[#5caaab]"}
                `}
              >
                {item.id}
              </div>
              <span
                className={`mt-3 text-sm text-center font-medium transition-colors duration-300
                  ${isActive ? "text-[#5caaab]" : "text-gray-500 group-hover:text-[#5caaab]"}
                `}
              >
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  
  
  

  const BuildingForm = () => (
    <form onSubmit={handleSubmitBuilding} className="flex flex-col gap-6">
      <div className={sectionBox}>
        <h2 className="text-xl font-bold text-[#4a9899] mb-4">Building Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(projectBuildingProgress)
  .filter(([key]) => key !== 'project_id')
  .map(([key, value]) => (
    <div key={key} className="flex flex-col">
      <label className="mb-2 font-medium capitalize">
        {key.replace(/_/g, ' ')}
      </label>
      <input
        type="number"
        name={key}
        value={value}
        min={0}
        max={100}
        onChange={(e) => {
          setFocusedField({ key, name: key }); // 👈 Set focused field
          handleBuildingChange(e);
        }}
        onKeyDown={handleKeyDown}
        className={inputStyles}
        ref={(el) => {
          inputRefs.current[`${key}-${key}`] = el; // 👈 Use key-name format
        }}
      />
    </div>
))}

        </div>
      </div>
      <button
        type="submit"
        className="self-end px-5 py-3 bg-[#5CAAAB] hover:bg-[#489496] text-white text-lg rounded-xl font-semibold shadow-lg transition"
      >
        Submit Building Progress
      </button>
    </form>
  );

  const CommonAreaForm = () => (
    <form onSubmit={handleSubmitCommonAreas} className="flex flex-col gap-6">
  <div className={sectionBox}>
    <h2 className="text-xl font-bold text-[#4a9899] mb-4">Common Areas Progress</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100 text-[#5caaab] font-semibold">
          <tr>
            <th className="border p-2 text-left">Area</th>
            <th className="border p-2 text-left">Proposed</th>
            <th className="border p-2 text-left">Percentage of Work</th>
            <th className="border p-2 text-left">Details</th>
          </tr>
        </thead>
        <tbody>
        {Object.entries(projectCommonAreasProgress)
  .filter(([key]) => key !== 'project_id')
  .map(([key, fields]) => (
    <tr key={key} className="even:bg-gray-50">
      <td className="border p-2 capitalize">{key.replace(/_/g, ' ')}</td>
      <td className="border p-2">
        <input
          type="checkbox"
          name="proposed"
          checked={fields.proposed}
          onChange={(e) => handleCommonAreaChange(e, key)}
          ref={el => inputRefs.current[`${key}-proposed`] = el}
        />
      </td>
      <td className="border p-2">
        <input
          type="number"
          name="percentage_of_work"
          value={fields.percentage_of_work}
          onChange={(e) => handleCommonAreaChange(e, key)}
          onKeyDown={handleKeyDown}
          min={0}
          max={100}
          className={inputStyles}
          ref={el => inputRefs.current[`${key}-percentage_of_work`] = el}
        />
      </td>
      <td className="border p-2">
        <input
          type="text"
          name="details"
          value={fields.details}
          onChange={(e) => handleCommonAreaChange(e, key)}
          onKeyDown={handleKeyDown}
          className={inputStyles}
          ref={el => inputRefs.current[`${key}-details`] = el}
        />
      </td>
    </tr>
))}

        </tbody>
      </table>
    </div>
  </div>

  <button
    type="submit"
    className="self-end px-5 py-3 bg-[#5CAAAB] hover:bg-[#489496] text-white text-lg rounded-xl font-semibold shadow-lg transition"
  >
    Submit Common Area Progress
  </button>
</form>

  );

  return (
    <div className=" mx-auto rounded-xl ">
      <ProgressBar />
      {step === 1 && <BuildingForm />}
      {step === 2 && <CommonAreaForm />}
    </div>
  );
}

export default ProjectProgressForm;
