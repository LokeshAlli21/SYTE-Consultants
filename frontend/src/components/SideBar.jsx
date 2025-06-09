import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaClipboardList, FaRegCalendarAlt, FaUser, FaWallet, FaPlus, FaUsers, FaCog, FaFileAlt, FaChartLine } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { BiTask, BiBarChartSquare } from 'react-icons/bi';
import { MdOutlinePeopleAlt, MdAdminPanelSettings } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import LogoutButton from '../components/LogoutButton'
import { useSelector } from 'react-redux';

const tabs = [
  { id: 'Dashboard', label: 'Dashboard', icon: <FaHome />, route: '/', accessKey: 'dashboard' },
  { 
    id: 'Promoters', 
    label: 'Promoters', 
    icon: <HiUserGroup />, 
    route: '/promoters', 
    accessKey: 'promoters',
    hasSubMenu: true,
    subItems: [
      { id: 'add-promoter', label: 'Add Promoter', icon: <FaPlus />, route: '/promoters/add' }
    ]
  },
  { 
    id: 'Projects', 
    label: 'Projects', 
    icon: <BiTask />, 
    route: '/projects', 
    accessKey: 'projects',
    hasSubMenu: true,
    subItems: [
      { id: 'add-project', label: 'Add Project', icon: <FaPlus />, route: '/projects/add' },
      // { id: 'professionals', label: 'Professionals', icon: <FaUsers />, route: '/projects/professionals' },
      // { id: 'unit-management', label: 'Unit Management', icon: <FaCog />, route: '/projects/unit-management' },
      // { id: 'documents', label: 'Documents', icon: <FaFileAlt />, route: '/projects/documents' },
      // { id: 'progress', label: 'Progress', icon: <FaChartLine />, route: '/projects/progress' }
    ]
  },
  { 
    id: 'Assignments', 
    label: 'Assignments', 
    icon: <FaUser />, 
    route: '/assignments', 
    accessKey: 'assignments',
    hasSubMenu: true,
    subItems: [
      { id: 'add-assignment', label: 'Add Assignment', icon: <FaPlus />, route: '/assignments/add' }
    ]
  },
  { 
    id: 'Channel Partners', 
    label: 'Channel Partners', 
    icon: <MdOutlinePeopleAlt />, 
    route: '/channel-partners', 
    accessKey: 'channel partners',
    hasSubMenu: true,
    subItems: [
      { id: 'add-channel-partner', label: 'Add Channel Partner', icon: <FaPlus />, route: '/channel-partners/add' }
    ]
  },
  { id: 'QPR', label: 'QPR', icon: <FaClipboardList />, route: '/qpr', accessKey: 'qpr' },
  { id: 'AA', label: 'AA', icon: <FaRegCalendarAlt />, route: '/aa', accessKey: 'aa' },
  { id: 'Reports', label: 'Reports', icon: <BiBarChartSquare />, route: '/reports', accessKey: 'reports' },
  { id: 'Accounts', label: 'Accounts', icon: <FaWallet />, route: '/accounts', accessKey: 'accounts' },
];

// Admin-only menu items
const adminTabs = [
  { id: 'Admin Panel', label: 'Admin Panel', icon: <MdAdminPanelSettings />, route: '/admin-panel' },
  { id: 'Syte Documents', label: 'Syte Documents', icon: <FaFileAlt />, route: '/syte-documents' },
];

function SideBar() {
  const authStatus = useSelector(state => state.auth.status);
  const userData = useSelector(state => state.auth.userData);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Check if user is admin
  const isAdmin = userData && userData.role === 'admin';

  const userAccessFields = userData?.access_fields || [];

  // Memoize the filtered tabs to prevent recreation on every render
  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => {
      // If user is admin, show all tabs
      if (isAdmin) return true;
      
      // Check if user has access to this tab
      return userAccessFields.includes(tab.accessKey);
    });
  }, [isAdmin, userAccessFields]);

  // Memoize the combined tabs to prevent recreation on every render
  const allTabs = useMemo(() => {
    return isAdmin ? [...filteredTabs, ...adminTabs] : filteredTabs;
  }, [isAdmin, filteredTabs]);

  // Toggle submenu expansion - only one submenu open at a time
  const toggleSubMenu = (tabId) => {
    setExpandedMenus(prev => {
      const isCurrentlyExpanded = prev[tabId];
      // Close all submenus first, then open the clicked one if it wasn't already open
      const newState = {};
      if (!isCurrentlyExpanded) {
        newState[tabId] = true;
      }
      return newState;
    });
  };

  // Handle main tab click
  const handleTabClick = (tab) => {
    if (tab.hasSubMenu) {
      // Always toggle the submenu and set as active
      toggleSubMenu(tab.id);
      setActiveTab(tab.id);
      setActiveSubTab('');
      navigate(tab.route);
    } else {
      // Close all submenus when clicking a non-submenu tab
      setExpandedMenus({});
      setActiveTab(tab.id);
      setActiveSubTab('');
      navigate(tab.route);
    }
  };

  // Handle sub tab click
  const handleSubTabClick = (parentTab, subTab) => {
    setActiveTab(parentTab.id);
    setActiveSubTab(subTab.id);
    navigate(subTab.route);
  };

  useEffect(() => {
    let matchedTab = null;
    let matchedSubTab = null;

    for (let tab of allTabs) {
      // Check sub-items first if they exist
      if (tab.hasSubMenu && tab.subItems) {
        for (let subItem of tab.subItems) {
          if (location.pathname === subItem.route || 
              (subItem.route !== "/" && location.pathname.startsWith(subItem.route))) {
            matchedTab = tab;
            matchedSubTab = subItem;
            // Auto-expand the parent menu
            setExpandedMenus(prev => ({ ...prev, [tab.id]: true }));
            break;
          }
        }
        if (matchedSubTab) break;
      }

      // Check main routes
      if (tab.route === "/" && location.pathname === "/") {
        matchedTab = tab;
        break;
      }

      if (tab.route !== "/" && location.pathname.startsWith(tab.route)) {
        // Only match if it's not a sub-route that we already handled
        if (!tab.hasSubMenu || location.pathname === tab.route) {
          matchedTab = tab;
          break;
        }
      }
    }

    if (matchedTab) {
      setActiveTab(matchedTab.id);
      setActiveSubTab(matchedSubTab ? matchedSubTab.id : '');
    }
  }, [location.pathname, allTabs]);

  if(!authStatus) return null;

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
          min-w-[250px]
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
            {/* Regular Menu Items */}
            {filteredTabs.map((tab) => (
              <div key={tab.id} className="mb-1">
                {/* Main Tab */}
                <div
                  onClick={() => handleTabClick(tab)}
                  className={`
                    flex items-center px-4 py-3 mx-2 rounded-xl font-medium text-sm 
                    cursor-pointer transition-all duration-300 ease-in-out
                    ${activeTab === tab.id && !activeSubTab ? 
                      'bg-[#5CAAAB] text-white shadow-md transform scale-[1.02]' : 
                      'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:transform hover:scale-[1.01]'
                    }
                  `}
                >
                  <span className='text-lg mr-3'>{tab.icon}</span>
                  <span className='flex-1'>{tab.label}</span>
                  {tab.hasSubMenu && (
                    <span className={`transition-all duration-300 ease-in-out ${expandedMenus[tab.id] ? 'rotate-90' : ''}`}>
                      <IoIosArrowForward size={16} />
                    </span>
                  )}
                </div>

                {/* Sub Menu with smooth animation */}
                {tab.hasSubMenu && (
                  <div 
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out z-50
                      ${expandedMenus[tab.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className='ml-6 mr-2 mt-2 mb-2 space-y-1 pl-4 border-l-2 border-gray-200'>
                      {tab.subItems.map((subItem, index) => (
                        <div
                          key={subItem.id}
                          onClick={() => handleSubTabClick(tab, subItem)}
                          className={`
                            flex items-center px-3 py-2 rounded-lg font-medium text-xs
                            cursor-pointer transition-all duration-300 ease-in-out
                            transform ${expandedMenus[tab.id] ? 'translate-x-0' : '-translate-x-4'}
                            ${activeSubTab === subItem.id ? 
                              'bg-gradient-to-r from-[#4A9A9B] to-[#5CAAAB] text-white shadow-lg border-l-4 border-white' : 
                              'text-gray-500 hover:text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-l-4 hover:border-[#5CAAAB] border-l-4 border-transparent'
                            }
                          `}
                          style={{
                            transitionDelay: expandedMenus[tab.id] ? `${index * 50}ms` : '0ms'
                          }}
                        >
                          <span className='text-sm mr-3 opacity-80'>{subItem.icon}</span>
                          <span className='font-semibold'>{subItem.label}</span>
                          {activeSubTab === subItem.id && (
                            <span className='ml-auto'>
                              <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className='mx-4 my-4 border-t border-gray-200'></div>
                <div className='mx-4 mb-2'>
                  <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Admin Section
                  </p>
                </div>
                {adminTabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => {
                      // Close all submenus when clicking admin tab
                      setExpandedMenus({});
                      setActiveTab(tab.id);
                      setActiveSubTab('');
                      navigate(tab.route);
                    }}
                    className={`
                      flex items-center px-4 py-3 mx-2 rounded-xl font-medium text-sm 
                      cursor-pointer transition-all duration-300 ease-in-out
                      ${tab.id === 'Syte Documents' ? 
                        // Special styling for Syte Documents
                        (activeTab === tab.id ? 
                          'bg-gradient-to-r mt-1.5 from-blue-600 via-purple-600 to-teal-600 text-white transform scale-[1.02]  ' : 
                          'bg-gradient-to-r mt-1.5 from-blue-50 to-purple-50 text-transparent bg-clip-text border-2 border-gradient-to-r border-purple-200 hover:from-blue-100 hover:to-purple-100 hover:bg-white hover:text-purple-700 hover:border-purple-300 hover:transform hover:scale-[1.02] relative overflow-hidden'
                        )
                        :
                        // Regular admin panel styling
                        (activeTab === tab.id ? 
                          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-[1.02]' : 
                          'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:transform hover:scale-[1.01]'
                        )
                      }
                    `}
                  >
                    {/* Background animation for Syte Documents when not active */}
                    {tab.id === 'Syte Documents' && activeTab !== tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-teal-100 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    )}
                    
                    <span className={`text-lg mr-3 relative z-10 ${tab.id === 'Syte Documents' && activeTab !== tab.id ? 'text-purple-600' : ''}`}>
                      {tab.icon}
                    </span>
                    <span className={`relative z-10 ${tab.id === 'Syte Documents' && activeTab !== tab.id ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent font-bold' : ''}`}>
                      {tab.label}
                    </span>
                    
                    {/* Special badge for Syte Documents */}
                    {tab.id === 'Syte Documents' ? (
                      <span className={`
                        ml-auto text-xs px-2 py-1 rounded-full font-bold transition-all duration-300 relative z-10
                        ${activeTab === tab.id ? 
                          'bg-white/20 text-white backdrop-blur-sm' : 
                          'bg-gradient-to-r from-blue-500 to-purple-500 text-white '
                        }
                      `}>
                        📚 DOCS
                      </span>
                    ) : (
                      // Regular admin badge
                      <span className={`
                        ml-auto text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300
                        ${activeTab === tab.id ? 
                          'bg-white/20 text-white' : 
                          'bg-red-100 text-red-600'
                        }
                      `}>
                        ADMIN
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Show a message if user has no access to any tabs */}
            {!isAdmin && filteredTabs.length === 0 && (
              <div className='px-4 py-6 text-center'>
                <p className='text-gray-500 text-sm'>No accessible modules found.</p>
                <p className='text-gray-400 text-xs mt-1'>Contact admin for access.</p>
              </div>
            )}
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