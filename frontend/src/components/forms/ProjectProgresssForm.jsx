import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UpdateInfoComponent from '../UpdateInfoComponent';

function ProjectProgressForm({
  disabled,
  projectId,
  projectBuildingProgress,
  projectCommonAreasProgress,
  setProjectBuildingProgress,
  setProjectCommonAreasProgress,
  handleSubmitProjectBuildingProgress,
  handleSubmitProjectCommonAreasProgresss,
}) {
  const [step, setStep] = useState(1);

  const navigate = useNavigate()

  const [focusedField, setFocusedField] = useState({ key: null, name: null });
const inputRefs = useRef({});
// console.log(projectCommonAreasProgress);



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
    
  // console.log('building',projectBuildingProgress,'\n',"cap: ",  projectCommonAreasProgress);
  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1]?.focus();
    }
  };

  const handleSubmitBuilding = async(e) => {
    e.preventDefault();
    const confirm = window.confirm("Submit Building Progress?");
    if (!confirm) return;
    if(await handleSubmitProjectBuildingProgress()) {setStep(p => p+1)}
  };

  const handleSubmitCommonAreas = async(e) => {
    e.preventDefault();
    const confirm = window.confirm("Submit Common Area Progress?");
    if (!confirm) return;
    if(await handleSubmitProjectCommonAreasProgresss()) {navigate('/projects')}
  };

  const inputStyles = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";
  const sectionBox = "bg-white p-6 rounded-xl shadow-lg border border-white/20";

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
        <div className='mb-4 flex flex-row items-center justify-around'>
          <h2 className="text-xl font-bold text-[#4a9899] flex-1 ">Building Progress</h2>
          {projectBuildingProgress.updated_by && <UpdateInfoComponent formData={projectBuildingProgress} />}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-md">
            <thead className="bg-gray-100 border-gray-300 text-[#5caaab] font-semibold">
              <tr>
                <th className="border border-gray-300 p-2 text-center w-15">Sr No</th>
                <th className="border border-gray-300 p-2 text-left">Stage</th>
                <th className="border border-gray-300 p-2 text-left">Percentage of Work</th>
              </tr>
            </thead>
            <tbody>
              {
              Object.entries(projectBuildingProgress)
                .filter(([key]) => !['project_id', 'id', 'updated_at', 'site_progress_id', 'created_at', 'updated_by', 'updated_user','update_action'].includes(key))
                .map(([key, value], index) => (
                  <tr key={key} className="even:bg-gray-50">
                    <td className="border border-gray-300 p-2 w-15 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2 capitalize">{key.replace(/_/g, ' ')}</td>
                    <td className="border border-gray-300 p-2">
                      <div className="relative">
                        <input
                          disabled={disabled}
                          type="number"
                          name={key}
                          value={value || ''}
                          min={0}
                          max={100}
                          onChange={(e) => {
                            setFocusedField({ key, name: key });
                            handleBuildingChange(e);
                          }}
                          onKeyDown={handleKeyDown}
          onWheel={(e) => e.target.blur()}
                          className={`${inputStyles} pr-10 appearance-none 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none 
                            moz:appearance-none`}
                          ref={(el) => {
                            inputRefs.current[`${key}-${key}`] = el;
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
  
      {!disabled && (
        <button
          type="submit"
          className="self-end px-5 py-3 bg-[#5CAAAB] hover:bg-[#489496] border border-white/20 text-white text-lg rounded-xl font-semibold shadow-lg transition"
        >
          Save Building Progress
        </button>
      )}
    </form>
  );
   

  const CommonAreaForm = () => (
    <form onSubmit={handleSubmitCommonAreas} className="flex flex-col gap-6">
        <div className={sectionBox}>
        <div className='mb-4 flex flex-row items-center justify-around'>
          <h2 className="text-xl font-bold text-[#4a9899] flex-1 ">Common Area Progress</h2>
          {projectCommonAreasProgress.updated_by && <UpdateInfoComponent formData={projectCommonAreasProgress} />}
        </div>
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-md">
        <thead className="bg-gray-100 border-gray-300 text-[#5caaab] font-semibold">
          <tr>
            <th className="border border-gray-300 p-2  w-15 text-center">Sr No</th>
            <th className="border border-gray-300 p-2 text-left">Area</th>
            <th className="border border-gray-300 p-2 text-center">Proposed</th>
            <th className="border border-gray-300 p-2 text-left">Percentage of Work</th>
            <th className="border border-gray-300 p-2 text-left">Details</th>
          </tr>
        </thead>
        <tbody>
        {Object.entries(projectCommonAreasProgress)
  .filter(([key]) => !['project_id', 'id', 'updated_at', 'created_at', 'updated_by', 'update_action', 'updated_user'].includes(key))
  .map(([key, fields], index) => (
    <tr key={key} className="even:bg-gray-50">
      <td className="border border-gray-300 p-2  w-15 text-center">{index + 1}</td>
      <td className="border border-gray-300 p-2 capitalize">{key.replace(/_/g, ' ')}</td>
      <td className="border border-gray-300 p-2">
        <input
disabled={disabled}
          type="checkbox"
          name="proposed"
          checked={fields.proposed}
          onChange={(e) => handleCommonAreaChange(e, key)}
          ref={el => inputRefs.current[`${key}-proposed`] = el}
          className='  w-5 h-5 accent-[#5caaab] cursor-pointer disabled:cursor-not-allowed'
        />
      </td>
      <td className="border border-gray-300 p-2">
      <div className="relative">
        <input
          disabled={disabled}
          type="number"
          name="percentage_of_work"
          value={fields.percentage_of_work || ''}
          onChange={(e) => handleCommonAreaChange(e, key)}
          onKeyDown={handleKeyDown}
          onWheel={(e) => e.target.blur()}
          min={0}
          max={100}
          className={`${inputStyles} pr-10 appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none 
            [&::-webkit-outer-spin-button]:appearance-none 
            moz:appearance-none`}
          ref={el => inputRefs.current[`${key}-percentage_of_work`] = el}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          %
        </span>
</div>
      </td>
      <td className="border border-gray-300 p-2">
        <input
disabled={disabled}
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

  {!disabled &&
  <button
    type="submit"
    className="self-end px-5 py-3 bg-[#5CAAAB] hover:bg-[#489496] border border-white/20 text-white text-lg rounded-xl font-semibold shadow-lg transition"
  >
    Save Common Area Progress
  </button>
}
</form>

  );

  if(!projectId){
    return
  }

  return (
    <div className=" mx-auto rounded-xl ">
      <ProgressBar />
      {step === 1 && <BuildingForm />}
      {step === 2 && <CommonAreaForm />}
    </div>
  );
}

export default ProjectProgressForm;
