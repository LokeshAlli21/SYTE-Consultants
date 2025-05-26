import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaClipboardList, FaRegCalendarAlt, FaUser } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { BiTask, BiBarChartSquare } from 'react-icons/bi';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import LogoutButton from '../components/LogoutButton'
import { useSelector } from 'react-redux';

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
  const authStatus = useSelector(state => state.auth.status);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  if(!authStatus) return

  return (
    <>
      {/* Toggle Button */}
      {location.pathname !== '/login' && (
        <div className='fixed top-4 left-4 z-50'>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className='p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200'
          >
            {sidebarOpen ? <IoMdClose size={24} /> : <FaBars size={24} />}
          </button>
        </div> 
      )}

      {/* Sidebar */}
      {location.pathname !== '/login' && (
        <div className={`
          fixed lg:static top-0 left-0 z-40 w-72 min-h-screen
          bg-white border-r border-gray-200
          shadow-xl lg:shadow-md
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full hidden'}
        `}>
          
          {/* Header */}
          <div className='px-6 py-6 border-b mt-10 border-gray-100'>
            <div 
              className='flex items-center cursor-pointer hover:opacity-80 transition-opacity'
              onClick={() => navigate('/')}
            >
              <img 
                className='w-12 h-12 object-contain' 
                src='/logo.png' 
                alt='Logo' 
              />
              <div className='ml-3'>
                <h1 className='text-lg font-bold text-gray-800 leading-tight'>
                  SYTE Consultants
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 px-4 py-4 pr-0 space-y-1 overflow-y-auto'>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(tab.route);
                }}
                className={`
                  flex items-center px-4 py-3 mx-2 rounded-xl font-medium text-sm 
                  cursor-pointer transition-all duration-200
                  ${activeTab === tab.id ? 
                    'bg-[#5CAAAB] text-white shadow-md' : 
                    'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                <span className='text-lg mr-3'>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            ))}
          </nav>

          {/* Logout Button Container */}
          <div className='px-4 py-3 pr-0 border-t bottom-0 border-gray-100'>
            <LogoutButton />
          </div>

          {/* Footer */}
           <div className='px-6 py-5 bg-gradient-to-r from-[#5CAAAB]/5 to-[#5CAAAB]/10 border-t border-gray-100'>
            <div className='text-center space-y-2'>
              <div className='flex items-center justify-center space-x-2'>
                <div className='w-2 h-2 bg-[#5CAAAB] rounded-full animate-pulse'></div>
                <h3 className='font-bold text-gray-800 text-sm tracking-wide'>SYTE Software</h3>
                <div className='w-2 h-2 bg-[#5CAAAB] rounded-full animate-pulse'></div>
              </div>
              <p className='text-xs text-gray-600 font-medium leading-relaxed'>
                Made with 
                <span className='inline-flex items-center mx-1'>
                  <span className='text-red-500 text-sm animate-pulse'>♥</span>
                </span> 
                by <span className='text-[#5CAAAB] font-semibold'>Syte Buildtech</span> Pvt. Ltd.
              </p>
              <div className='flex justify-center'>
                <div className='w-12 h-0.5 bg-gradient-to-r from-transparent via-[#5CAAAB] to-transparent rounded-full'></div>
              </div>
            </div>
            </div>



        </div>
      )}
    </>
  );
}

export default SideBar;