import React from 'react'

const FilterBar = () => {
    return (
      <div className="flex items-center gap-4 mb-6">
        <button className="border border-[#5CAAAB] rounded-full px-6 py-2 text-[#5CAAAB] font-medium">
          Export ▼
        </button>
        <button className="border border-[#5CAAAB] rounded-full px-6 py-2 text-[#5CAAAB] font-medium">
          District ▼
        </button>
        <button className="border border-[#5CAAAB] rounded-full px-6 py-2 text-[#5CAAAB] font-medium">
          City ▼
        </button>
        <button className="ml-auto bg-[#5CAAAB] text-white px-6 py-2 rounded-full font-medium">
          + New Promoter
        </button>
      </div>
    );
  };
  
  export default FilterBar;
  