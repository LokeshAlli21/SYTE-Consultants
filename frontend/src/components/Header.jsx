import { FaArrowLeft, FaBell, FaRegCircleUser } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between mb-6 pl-6">
      <div className="flex items-center gap-2">
        <FaArrowLeft className="text-[#2F4C92] text-3xl" onClick={() => {navigate(-1)}}/>
        <h1 className="text-[24px] font-bold text-[#2F4C92]">Promoters</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* <div className="relative">
          <input
            type="text"
            placeholder="Search here..."
            className="bg-white rounded-full px-4 py-2 w-64 pl-10 shadow-sm"
          />
          <span className="absolute top-2.5 left-3 text-gray-400">🔍</span>
        </div> */}

        <div className="text-right">
          <p className="text-sm font-medium">Admin Name</p>
          <p className="text-xs text-gray-500">Admin</p>
        </div>
        <div className="w-10 h-10 bg-[#C2C2FF] rounded-full"></div> 
      </div>
    </div>
  );
};

export default Header;
