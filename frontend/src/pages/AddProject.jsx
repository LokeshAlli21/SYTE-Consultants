import React, { useState } from 'react'

const tabs = [
    "Project Details",
    "Professional Details",
    "Unit Details",
    "Documents",
    "Project Progress"
  ];

function AddProject() {

  const [activeTab, setActiveTab] = useState(tabs[0]);

  const renderForm = () => {
    switch (activeTab) {
      case "Project Details":
        return (
          <div>
            <input type="text" placeholder="Project Name" className="input" />
            <input type="text" placeholder="Location" className="input" />
            <button className="btn">Save</button>
          </div>
        );
      case "Professional Details":
        return (
          <div>
            <input type="text" placeholder="Engineer Name" className="input" />
            <input type="email" placeholder="Email" className="input" />
            <button className="btn">Save</button>
          </div>
        );
      case "Unit Details":
        return (
          <div>
            <input type="number" placeholder="Number of Units" className="input" />
            <button className="btn">Save</button>
          </div>
        );
      case "Documents":
        return (
          <div>
            <input type="file" className="input" />
            <button className="btn">Save</button>
          </div>
        );
      case "Project Progress":
        return (
          <div>
            <input type="text" placeholder="Status" className="input" />
            <input type="date" className="input" />
            <button className="btn">Save</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 border-b-2 ${activeTab === tab ? "border-blue-500 font-semibold" : "border-transparent"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="mt-4 space-y-4">{renderForm()}</div>
    </div>
  );
};

export default AddProject