import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaClipboardList, FaRegCalendarAlt, FaUser } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { BiTask, BiBarChartSquare } from 'react-icons/bi';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';

const tabs = [
  { id: 'Dashboard', label: 'Dashboard', icon: <FaHome />, route: '/' },
  { id: 'Promoters', label: 'Promoters', icon: <HiUserGroup />, route: '/promoters' },
  { id: 'Projects', label: 'Projects', icon: <BiTask />, route: '/projects' },
  { id: 'Assignments', label: 'Assignments', icon: <FaUser />, route: '/assignments' },
  { id: 'Channel Partners', label: 'Channel Partners', icon: <MdOutlinePeopleAlt />, route: '/channel-partners' },
  { id: 'QPR', label: 'QPR', icon: <FaClipboardList />, route: '/qpr' },
  { id: 'AA', label: 'AA', icon: <FaRegCalendarAlt />, route: '/aa' },
  { id: 'Reports', label: 'Reports', icon: <BiBarChartSquare />, route: '/reports' },
];

function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let matchedTab = null;

    for (let tab of tabs) {
      if (tab.route === "/" && location.pathname === "/") {
        matchedTab = tab;
        break;
      }

      if (tab.route !== "/" && location.pathname.startsWith(tab.route)) {
        matchedTab = tab;
        break;
      }
    }

    if (matchedTab) {
      setActiveTab(matchedTab.id);
    }
  }, [location.pathname]);

  return (
    <>
      <div className='absolute px-3 py-4 flex justify-between items-center'>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className='text-gray-800'>
          {sidebarOpen ? <IoMdClose size={30} /> : <FaBars size={30} />}
        </button>
      </div>

      {sidebarOpen && location.pathname !== '/login' && (
        <div className='max-w-70 flex flex-col items-center bg-white text-black pl-4 pt-8 pr-0 space-y-2 min-h-full left-0 top-0 bottom-0'>
          <div className='flex pr-4 items-center justify-start font-semibold text-[24px] font-inter'>
            <img className='max-w-[77px]' src='../logo.png' alt='Logo' />
            <h2 className='ml-[-18px]'>SYTE Consultants</h2>
          </div>

          <div className='flex-1 w-full pl-4 flex flex-col gap-2.5'>
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(tab.route);
                }}
                className={`w-full text-left px-[24px] py-[16px] font-medium text-[18px] rounded-tl-[40px] rounded-bl-[40px] leading-[100%] font-inter flex items-center ${
                  activeTab === tab.id ? 'bg-[#5CAAAB] text-white' : 'hover:bg-[#5CAAAB] hover:text-white'
                }`}
              >
                <span className='text-xl'>{tab.icon}</span>
                <h2 className='ml-4'>{tab.label}</h2>
              </div>
            ))}
          </div>

          <div className='bottom-0 py-4 mt-5'>
            <h2 className='font-bold'>SYTE Software</h2>
            <p className='text-[14px] mt-2'>Made with ♥ by Syte Buildtech Pvt. Ltd.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default SideBar;
