import React from 'react';
import { useNavigate } from 'react-router-dom';

const FilterBar = () => {
  const navigate = useNavigate();

  const handleNewPromoterClick = () => {
    navigate('/promoters/add');
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4">
      <div className="flex gap-3">
        <button className="border border-[#5CAAAB] rounded-full px-5 py-2 text-[#5CAAAB] font-medium transition hover:bg-[#5CAAAB] hover:text-white">
          Export ▼
        </button>
        <button className="border border-[#5CAAAB] rounded-full px-5 py-2 text-[#5CAAAB] font-medium transition hover:bg-[#5CAAAB] hover:text-white">
          District ▼
        </button>
        <button className="border border-[#5CAAAB] rounded-full px-5 py-2 text-[#5CAAAB] font-medium transition hover:bg-[#5CAAAB] hover:text-white">
          City ▼
        </button>
      </div>
      <button
        onClick={handleNewPromoterClick}
        className="ml-auto bg-[#5CAAAB] text-white px-6 py-2 rounded-full font-medium transition hover:bg-[#489090] shadow-sm"
      >
        + New Promoter
      </button>
    </div>
  );
};

export default FilterBar;
