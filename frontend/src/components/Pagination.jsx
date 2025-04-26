const Pagination = () => {
    return (
      <div className="flex justify-between items-center mt-4 px-2 text-sm text-gray-600">
        <span>
          Showing 1-5 from <b>100</b> data
        </span>
        <div className="flex items-center gap-2">
          <button className="text-[#5CAAAB]">◀</button>
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              className={`w-8 h-8 rounded-full border ${
                num === 1 ? 'bg-[#5CAAAB] text-white' : 'text-[#5CAAAB]'
              }`}
            >
              {num}
            </button>
          ))}
          <button className="text-[#5CAAAB]">▶</button>
        </div>
      </div>
    );
  };
  
  export default Pagination;
  