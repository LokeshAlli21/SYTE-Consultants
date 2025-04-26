import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from 'react-icons/fa';

const tabs = [
  { id: "Dashboard", label: "Dashboard", icon: "../icons/Home.png", route: "/" },
  { id: "Promoters", label: "Promoters", icon: "../icons/Student.png", route: "/promoters" },
  { id: "Projects", label: "Projects", icon: "../icons/Teacher.png", route: "/projects" },
  { id: "Assignments", label: "Assignments", icon: "../icons/User.png", route: "/assignments" },
  { id: "Channel Partners", label: "Channel Partners", icon: "../icons/Activity.png", route: "/channel-partners" },
  { id: "QPR", label: "QPR", icon: "../icons/Finance.png", route: "/qpr" },
  { id: "AA", label: "AA", icon: "../icons/Calendar.png", route: "/aa" },
  { id: "Reports", label: "Reports", icon: "../icons/Activity.png", route: "/reports" },
];

function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

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
    <div className=' absolute px-3 py-4 flex justify-between items-center'>
    <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-800 "
            >
              <FaBars size={30} />
            </button>
    </div>
    {
      sidebarOpen &&

<div className={`max-w-70 flex flex-col items-center bg-[#FFFFFF] text-[#000000] pl-4 pt-8 pr-0 space-y-2 min-h-full left-0 top-0 bottom-0 
  ${(location.pathname === '/login') && 'hidden'} 
`}>
    <div className="flex pr-4  flex-nowrap items-center justify-start font-semibold text-[24px] leading-[100%] tracking-[0] font-inter">
        <img className=' max-w-[77px]' src="../logo.png" alt="" />
        <h2 className=' ml-[-18px]'>
        SYTE Consultants 
        </h2>
    </div>
    <div className='flex-1 pl-4 text-[#1F1F1F] flex flex-col gap-2.5'>
    {tabs.map((tab) => (
      <div
        key={tab.id}
        onClick={() => {
          setActiveTab(tab.id)
          navigate(tab.route)
        }}
        className={`w-full text-left px-4 py-2 px-[24px] py-[16] font-medium text-[18px]  rounded-tl-[40px] rounded-bl-[40px] leading-[100%] tracking-[0] font-inter  flex flex-row flex-none items-center justify-start ${
          activeTab === tab.id ? "bg-[#5CAAAB] text-white" : "hover:bg-[#5CAAAB] hover:text-white"
        }`}
      >
        <img src={tab.icon} 
         alt="" />
        <h2 className=' flex-1 ml-4'>{tab.label}</h2>
      </div>
    ))}
    </div>
    <div className=' bottom-0 py-4 mt-5 '>
      <h2 className=' font-bold'>SYTE Software</h2>
      <p className=' text-[14px] mt-2'>Made with ♥ by Syte Buildtech Pvt. Ltd.</p>
    </div>
  </div>

    }
    </>
  )
}

export default SideBar